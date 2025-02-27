import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TemplateComunicationItemsDTO } from '@data/models/templates/templates-communication-dto';
import WorkflowCardsLimitDTO, {
  CardLimitSlotByDayDTO,
  CardLimitSlotDTO
} from '@data/models/workflow-admin/workflow-card-limit-dto';
import WorkflowEventMailDTO from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-workflow-card-movement-preparation',
  templateUrl: './workflow-card-movement-preparation.component.html',
  styleUrls: ['./workflow-card-movement-preparation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowCardMovementPreparationComponent implements OnInit {
  public taskForm: UntypedFormGroup = null;
  public cardsLimitForm: UntypedFormGroup = null;
  public formsCreated = false;
  public userForm: UntypedFormGroup = null;
  public preparationIn: WorkflowSubstateEventDTO = null;
  public preparationInForm: UntypedFormGroup = null;
  public preparationOut: WorkflowSubstateEventDTO = null;
  public preparationOutForm: UntypedFormGroup = null;
  public preparationMov: WorkflowSubstateEventDTO = null;
  public preparationMovForm: UntypedFormGroup = null;
  public usersIn: WorkflowSubstateUserDTO[] = [];
  public usersOut: WorkflowSubstateUserDTO[] = [];
  public usersMov: WorkflowSubstateUserDTO[] = [];
  public userInDisabled = false;
  public userOutDisabled = false;
  public userMovDisabled = false;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: false
  };
  public labels = {
    in: marker('prepareMovement.inTab'),
    out: marker('prepareMovement.outTab'),
    mov: marker('prepareMovement.moveTab'),
    title: marker('prepareMovement.title'),
    size: marker('prepareMovement.size'),
    sizePlaceholder: marker('prepareMovement.sizePlaceholder'),
    user: marker('prepareMovement.user'),
    userPlaceholder: marker('prepareMovement.userPlaceholder'),
    template: marker('prepareMovement.template'),
    templatePlaceholder: marker('prepareMovement.templatePlaceholder'),
    required: marker('errors.required'),
    save: marker('common.save'),
    insertText: marker('common.insertTextHere'),
    taskLabel: marker('prepareMovement.taskLabel'),
    taskPlaceholder: marker('prepareMovement.taskPlaceholder'),
    taskHistoricLabel: marker('prepareMovement.taskHistoricLabel'),
    taskHistoricalPlaceholder: marker('prepareMovement.taskHistoricalPlaceholder'),
    extraMovement: marker('prepareMovement.extraMovement'),
    emails: marker('common.emails'),
    errorPatternMessage: marker('errors.emailPattern'),
    subject: marker('emails.subject'),
    receivers: marker('emails.receivers'),
    deadLineDate: marker('newCard.workflow.deadLineDate'),
    deadLineHour: marker('newCard.workflow.deadLineHour'),
    numOf: marker('pagination.pageShortOf')
  };
  public tabsToShow: ('IN' | 'OUT' | 'MOV')[] = [];
  public tabToShow: 'IN' | 'OUT' | 'MOV';
  public sendToOtherWorkflow = false;
  public mainUserSelector = false;
  public workflowCardsLimit: WorkflowCardsLimitDTO = null;
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public minDate = new Date();
  public maxDate = new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate());
  public cardsLimits: CardLimitSlotByDayDTO[] = [];
  public maxCardsByHour = 0;
  public cardsLimitsExceeded = false;
  private datePipe = new DatePipe('en-EN');

  constructor(
    public dialogRef: MatDialogRef<WorkflowCardMovementPreparationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      titel?: string;
      forceDateLimit?: boolean;
      destinationName: string;
      preparation: WorkflowSubstateEventDTO[];
      usersIn: WorkflowSubstateUserDTO[];
      usersOut: WorkflowSubstateUserDTO[];
      view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS';
      selectedUser: WorkflowSubstateUserDTO;
      mainUserSelector: boolean;
      workflowCardsLimit: WorkflowCardsLimitDTO;
      workflowDestinatioId: number;
      cardIntanceId: number;
      altSubstateLimit: {
        destinationName: string;
        preparation: WorkflowSubstateEventDTO[];
        usersIn: WorkflowSubstateUserDTO[];
      };
    },
    private fb: FormBuilder,
    private workflowService: WorkflowsService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.usersIn = this.data.usersIn;
    this.usersOut = this.data.usersOut;
    this.usersMov = this.data.usersIn?.length ? this.data.usersIn : this.data.usersOut;
    this.mainUserSelector = this.data.mainUserSelector;
    this.workflowCardsLimit = this.data.workflowCardsLimit;
    this.cardsLimits = [];

    if (this.data.view === 'MOVES_IN_OTHER_WORKFLOWS' || this.data.forceDateLimit) {
      this.sendToOtherWorkflow = true;
    }
    if (this.sendToOtherWorkflow && !this.data.forceDateLimit) {
      this.taskForm = this.fb.group({
        description: [null, Validators.required]
      });
    }

    if (!this.workflowCardsLimit?.cardsLimit || !this.allowOverLimit()) {
      // eslint-disable-next-line max-len
      //Si no hay límite de tarjetas o no se puede sobrepasar el límite, no puede darse el caso de que se cambiar el subestado destino
      this.setMovesEventsFormsAndTabs();
    }

    if (this.workflowCardsLimit?.cardsLimit) {
      this.maxCardsByHour = this.workflowCardsLimit?.numCardsByHour;
      const spinner = this.spinnerService.show();
      this.workflowService
        .getCardLimitsCreatecardList(this.data.workflowDestinatioId, null, this.data.cardIntanceId)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe({
          next: (data: CardLimitSlotByDayDTO[]) => {
            this.cardsLimits = data ? data : [];
            this.cardsLimits.forEach((cl) => {
              const newSlots: CardLimitSlotDTO[] = [];
              for (let x = this.workflowCardsLimit.initTime; x <= this.workflowCardsLimit.endTime; x++) {
                let slot: CardLimitSlotDTO = cl.carLimitSlots.find((c) => c.hourFrom === x);
                slot = slot
                  ? slot
                  : {
                      cards: 0,
                      hourFrom: x,
                      hourTo: x + 1
                    };
                slot.maxReached = false;
                if (slot.cards >= this.workflowCardsLimit.numCardsByHour) {
                  slot.maxReached = true;
                }
                newSlots.push(slot);
              }
              cl.carLimitSlots = newSlots;
            });
            this.cardsLimitForm = this.fb.group({
              deadLineDate: [null, Validators.required],
              deadLineHour: [null, Validators.required]
            });
          },
          error: (e) => {
            console.log(e);
          }
        });
    }
  }

  public changeDeadLine(resetSlot = false): void {
    if (resetSlot) {
      this.cardsLimitForm.get('deadLineHour').setValue(null);
    }
    const date: Date = this.cardsLimitForm.get('deadLineDate').value;
    const slot: CardLimitSlotDTO = this.cardsLimitForm.get('deadLineHour').value;
    this.cardsLimitsExceeded = false;
    if (date && !this.checkDateDisponibility(date) && !this.data.forceDateLimit) {
      this.cardsLimitsExceeded = true;
    } else if (slot?.maxReached && !this.data.forceDateLimit) {
      this.cardsLimitsExceeded = true;
    }
    this.tabsToShow = [];
    this.formsCreated = false;
    this.userForm = null;
    this.preparationIn = null;
    this.preparationInForm = null;
    this.preparationOut = null;
    this.preparationOutForm = null;
    this.preparationMov = null;
    this.preparationMovForm = null;
    if (date && slot) {
      this.setMovesEventsFormsAndTabs();
    }
  }

  public setMovesEventsFormsAndTabs(): void {
    const events: WorkflowSubstateEventDTO[] = this.cardsLimitsExceeded
      ? this.data.altSubstateLimit.preparation
      : this.data.preparation;
    this.usersIn = this.cardsLimitsExceeded ? this.data.altSubstateLimit.usersIn : this.data.usersIn;
    events?.forEach((p: WorkflowSubstateEventDTO) => {
      if (
        p.substateEventType === 'IN' &&
        (p.requiredSize ||
          // (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersIn)) ||
          p.requiredUser ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.preparationIn = p;
        this.addTabToShow(p.substateEventType, p);
      } else if (
        p.substateEventType === 'OUT' &&
        (p.requiredSize ||
          // (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersOut)) ||
          p.requiredUser ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.preparationOut = p;
        this.addTabToShow(p.substateEventType, p);
      } else if (
        p.substateEventType === 'MOV' &&
        (p.requiredSize ||
          // (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersMov)) ||
          p.requiredUser ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.preparationMov = p;
        this.addTabToShow(p.substateEventType, p);
      }
    });
    this.tabToShow = this.tabsToShow[0];
    // if (this.data.selectedUser?.user?.id && this.findUserIn(this.data.selectedUser, this.usersIn)) {
    //   this.userInDisabled = true;
    // }
    // if (this.data.selectedUser?.user?.id && this.findUserIn(this.data.selectedUser, this.usersOut)) {
    //   this.userOutDisabled = true;
    //   this.userMovDisabled = true;
    // }
    this.initForm();
  }

  addTabToShow(type: 'IN' | 'OUT' | 'MOV', p: WorkflowSubstateEventDTO): void {
    if (p.requiredSize || p.sendMail || p.requiredHistoryComment || (p.requiredMovementExtra && !p.movementExtraAuto)) {
      this.tabsToShow.push(type);
    }
  }

  hoursList(): CardLimitSlotDTO[] {
    const day: Date = this.cardsLimitForm.get('deadLineDate').value;
    if (this.workflowCardsLimit?.cardsLimit && day) {
      const dString = this.datePipe.transform(day, 'dd/MM/YYYY');
      const dayInfo = this.cardsLimits.filter((cl) => cl.day === dString)[0];
      if (dayInfo?.carLimitSlots?.length) {
        return dayInfo.carLimitSlots;
      } else {
        const newSlots: CardLimitSlotDTO[] = [];
        for (let x = this.workflowCardsLimit.initTime; x <= this.workflowCardsLimit.endTime; x++) {
          const slot: CardLimitSlotDTO = {
            cards: 0,
            hourFrom: x,
            hourTo: x + 1,
            maxReached: false
          };
          newSlots.push(slot);
          this.cardsLimits.push({
            day: dString,
            totalCards: 0,
            carLimitSlots: newSlots
          });
        }
        return newSlots;
      }
    }
    return [];
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const d = cellDate;
      if (
        d.getFullYear() < new Date().getFullYear() ||
        (d.getFullYear() === new Date().getFullYear() && d.getMonth() < new Date().getMonth()) ||
        (d.getFullYear() === new Date().getFullYear() &&
          d.getMonth() === new Date().getMonth() &&
          d.getDate() < new Date().getDate()) ||
        d.getDay() === 0 ||
        (this.data.workflowCardsLimit?.saturdayExcluded && d.getDay() === 6)
      ) {
        return '';
      }
      if (!this.minDaysAdvanceNotice(d)) {
        return '';
      }
      if (this.workflowCardsLimit?.cardsLimit) {
        return this.checkDateDisponibility(d) ? 'available-date-class' : 'max-reached-date-class';
      }
      return 'available-date-class';
    }
    return '';
  };
  minDaysAdvanceNotice = (d: Date | null): boolean => {
    if (
      !this.allowOverLimit() &&
      (this.workflowCardsLimit?.minDaysAdvanceNotice || this.workflowCardsLimit?.minDaysAdvanceNotice === 0)
    ) {
      const days = this.workflowCardsLimit?.minDaysAdvanceNotice;
      let diferenciaDias = Math.floor((+d - +new Date()) / (1000 * 60 * 60 * 24));
      const diffDias = diferenciaDias;
      // Iterar sobre cada día entre las dos fechas
      for (let i = 0; i <= diffDias; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i + 1);
        if (fecha.getDay() === 0 || fecha.getDay() === 6) {
          diferenciaDias--;
        }
      }
      if (diferenciaDias < days) {
        return false;
      }
    }
    return true;
  };
  datesLimitFilter = (d: Date | null): boolean => {
    d = d ? d : new Date();
    // Prevent Sunday from being selected.
    if (
      d.getDay() === 0 ||
      (this.data.workflowCardsLimit?.saturdayExcluded && d.getDay() === 6) ||
      !this.minDaysAdvanceNotice(d)
    ) {
      return false;
    }
    if (this.workflowCardsLimit?.cardsLimit && !this.allowOverLimit()) {
      return this.checkDateDisponibility(d);
    }
    return true;
  };
  checkDateDisponibility(d: Date): boolean {
    const dString = this.datePipe.transform(d, 'dd/MM/YYYY');
    const dayInfo = this.cardsLimits.filter((cl) => cl.day === dString)[0];
    //Comprobamos que no sobrepase el limite diario
    if (dayInfo && dayInfo.totalCards >= this.workflowCardsLimit.numCardsByDay) {
      return false;
    } else if (
      dayInfo &&
      dayInfo.carLimitSlots?.length &&
      dayInfo.carLimitSlots.reduce((a: boolean, b: CardLimitSlotDTO) => {
        if (!a || !b.maxReached) {
          a = false;
        }
        return a;
      }, true)
    ) {
      return false;
    }
    return true;
  }
  allowOverLimit(): boolean {
    const userRol = this.authService.getUserRole();
    if (
      this.workflowCardsLimit?.allowOverLimit &&
      (!this.workflowCardsLimit.allowOverLimitRoles ||
        this.workflowCardsLimit.allowOverLimitRoles.length === 0 ||
        this.workflowCardsLimit.allowOverLimitRoles.find((r) => r.id === userRol.id))
    ) {
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabSelected(event: any) {
    this.tabToShow = this.tabsToShow[event.index];
  }

  public showTab(type: 'IN' | 'OUT' | 'MOV'): boolean {
    if (
      type === 'IN' &&
      this.preparationIn &&
      ((this.preparationIn.requiredMovementExtra && !this.preparationIn.movementExtraAuto) ||
        (Object.keys(this.preparationInForm?.controls).length === 1 &&
          Object.keys(this.preparationInForm?.controls)[0] !== 'user') ||
        Object.keys(this.preparationInForm?.controls).length > 1)
    ) {
      return true;
    } else if (
      type === 'OUT' &&
      this.preparationOut &&
      ((this.preparationOut.requiredMovementExtra && !this.preparationOut.movementExtraAuto) ||
        (Object.keys(this.preparationOutForm?.controls).length === 1 &&
          Object.keys(this.preparationOutForm?.controls)[0] !== 'user') ||
        Object.keys(this.preparationOutForm?.controls).length > 1)
    ) {
      return true;
    } else if (
      type === 'MOV' &&
      this.preparationMov &&
      ((this.preparationMov.requiredMovementExtra && !this.preparationMov.movementExtraAuto) ||
        (Object.keys(this.preparationMovForm?.controls).length === 1 &&
          Object.keys(this.preparationMovForm?.controls)[0] !== 'user') ||
        Object.keys(this.preparationMovForm?.controls).length > 1)
    ) {
      return true;
    }
    return false;
  }

  public initForm(): void {
    if (this.mainUserSelector) {
      const user = this.findUserIn(this.data.selectedUser, this.usersIn)
        ? this.findUserIn(this.data.selectedUser, this.usersIn)
        : this.findUserIn(this.data.selectedUser, this.usersOut);
      this.userForm = this.fb.group({
        user: [user, Validators.required]
      });
    }
    if (this.preparationIn) {
      this.preparationInForm = this.fb.group({});
      if (this.preparationIn.requiredSize) {
        this.preparationInForm.addControl('size', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationIn.requiredUser) {
        this.preparationInForm.addControl(
          'user',
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersIn) : null)
        );
      }
      if (this.preparationIn.requiredHistoryComment) {
        this.preparationInForm.addControl('historyComment', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationIn.requiredMovementExtra) {
        this.preparationInForm.addControl('movementExtraConfirm', this.fb.control(this.preparationIn.movementExtraAuto, []));
      }
      if (this.preparationIn.sendMail) {
        this.addMailFormControl(this.preparationInForm, this.preparationIn);
      }
    }
    if (this.preparationOut) {
      this.preparationOutForm = this.fb.group({});
      if (this.preparationOut.requiredSize) {
        this.preparationOutForm.addControl('size', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationOut.requiredUser) {
        this.preparationOutForm.addControl(
          'user',
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersOut) : null)
        );
      }
      if (this.preparationOut.requiredHistoryComment) {
        this.preparationOutForm.addControl('historyComment', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationOut.requiredMovementExtra) {
        this.preparationOutForm.addControl('movementExtraConfirm', this.fb.control(this.preparationOut.movementExtraAuto, []));
      }
      if (this.preparationOut.sendMail) {
        this.addMailFormControl(this.preparationOutForm, this.preparationOut);
      }
    }
    if (this.preparationMov) {
      this.preparationMovForm = this.fb.group({});
      if (this.preparationMov.requiredSize) {
        this.preparationMovForm.addControl('size', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationMov.requiredUser) {
        this.preparationMovForm.addControl(
          'user',
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersMov) : null)
        );
      }
      if (this.preparationMov.requiredHistoryComment) {
        this.preparationMovForm.addControl('historyComment', this.fb.control(null, [Validators.required]));
      }
      if (this.preparationMov.requiredMovementExtra) {
        this.preparationMovForm.addControl('movementExtraConfirm', this.fb.control(this.preparationMov.movementExtraAuto, []));
      }
      if (this.preparationMov.sendMail) {
        this.addMailFormControl(this.preparationMovForm, this.preparationMov);
      }
    }
    // console.log(this.preparationInForm);
    // console.log(this.preparationOutForm);
    // console.log(this.preparationMovForm);
    this.formsCreated = true;
  }

  public addMailFormControl = (fControl: UntypedFormGroup, mov: WorkflowSubstateEventDTO): void => {
    fControl.addControl(
      'mailEvents',
      this.fb.array(
        mov.workflowEventMails.map((em: WorkflowEventMailDTO) =>
          this.fb.group({
            id: [em.id, Validators.required],
            items: this.fb.array(
              em.templateComunication.templateComunicationItems.map((tc: TemplateComunicationItemsDTO) =>
                this.fb.group({
                  id: [tc.id, Validators.required],
                  messageChannel: [tc.messageChannel],
                  processedEmail: [em.processedEmail && tc.messageChannel.id === 2 ? em.processedEmail.split(',') : []],
                  subject: [tc.processedSubject, tc.messageChannel.id === 2 ? [Validators.required] : []],
                  template: [tc.processedText, Validators.required]
                })
              )
            )
          })
        )
      )
    );
  };

  public getMailEventTitle(mailEvent: UntypedFormControl, i: number, l: number): string {
    let title = this.translateService.instant(this.labels.template);
    if (l > 1) {
      title += ` - ${i + 1}`;
    }
    return title;
  }

  public getWfEventsMailsFormArray(form: 'IN' | 'OUT' | 'MOV'): UntypedFormArray {
    if (form === 'IN' && this.preparationInForm?.controls?.mailEvents) {
      return this.preparationInForm.controls.mailEvents as UntypedFormArray;
    } else if (form === 'OUT' && this.preparationOutForm?.controls?.mailEvents) {
      return this.preparationOutForm.controls.mailEvents as UntypedFormArray;
    } else if (form === 'MOV' && this.preparationMovForm?.controls?.mailEvents) {
      return this.preparationMovForm.controls.mailEvents as UntypedFormArray;
    }
    return this.fb.array([]);
  }

  public findUserIn(user: WorkflowSubstateUserDTO, users: WorkflowSubstateUserDTO[]): WorkflowSubstateUserDTO {
    return users?.find((item: WorkflowSubstateUserDTO) => item.user.id === user?.user?.id);
  }

  public getMovementExtraLabel(preparation: WorkflowSubstateEventDTO): string {
    return this.translateService.instant(marker('prepareMovement.extraMovementQuestion'), {
      // eslint-disable-next-line max-len
      destination: `<b>${preparation.workflowSubstateTargetExtra?.workflowState?.name} - ${preparation.workflowSubstateTargetExtra?.name}</b>`
    });
  }

  public getUserFullname(user: WorkflowSubstateUserDTO): string {
    if (user.user.fullName) {
      return user.user.fullName;
    } else {
      let fullName = user.user.name;
      if (user.user.firstName) {
        fullName += ` ${user.user.firstName}`;
      }
      if (user.user.lastName) {
        fullName += ` ${user.user.lastName}`;
      }
      return fullName;
    }
  }

  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }
  public textEditorContentChanged(html: string, form: UntypedFormGroup) {
    if (html !== form.controls.template.value) {
      if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
        html = null;
      }
      form.get('template').setValue(html, { emitEvent: true });
      form.get('template').markAsDirty();
      form.get('template').markAsTouched();
    }
  }

  public getTabLabel(tab: 'IN' | 'OUT' | 'MOV'): string {
    if (tab === 'IN') {
      return this.translateService.instant(this.labels.in);
    } else if (tab === 'OUT') {
      return this.translateService.instant(this.labels.out);
    } else {
      return this.translateService.instant(this.labels.mov);
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  public save(): void {
    if (this.mainUserSelector && this.userForm.get('user').value) {
      const user = this.userForm.get('user').value;
      if (this.preparationOut?.requiredUser) {
        this.preparationOutForm.get('user').setValue(user);
      }
      if (this.preparationIn?.requiredUser) {
        this.preparationInForm.get('user').setValue(user);
      }
      if (this.preparationMov?.requiredUser) {
        this.preparationMovForm.get('user').setValue(user);
      }
    }
    const data = {
      task: this.taskForm ? this.taskForm.value : null,
      user: this.userForm ? this.userForm.value : null,
      deadLine: this.cardsLimitForm ? this.cardsLimitForm.value : null,
      cardsLimitsExceeded: this.cardsLimitsExceeded,
      targetId: this.cardsLimitsExceeded ? this.workflowCardsLimit.workflowSubstate.id : null,
      in: this.preparationInForm ? this.preparationInForm.value : null,
      out: this.preparationOutForm ? this.preparationOutForm.value : null,
      mov: this.preparationMovForm ? this.preparationMovForm.value : null
    };
    this.dialogRef.close(data);
  }

  public disableSaveButton(): boolean {
    return (
      this.taskForm?.invalid ||
      this.userForm?.invalid ||
      this.preparationInForm?.invalid ||
      this.preparationOutForm?.invalid ||
      this.preparationMovForm?.invalid
    );
  }

  public getModalTitle(): string {
    if (this.data.titel) {
      return this.data.titel;
    } else if (this.cardsLimitsExceeded) {
      return this.translateService.instant(this.labels.title, { destination: this.data.altSubstateLimit.destinationName });
    }
    return this.translateService.instant(this.labels.title, { destination: this.data.destinationName });
  }
}

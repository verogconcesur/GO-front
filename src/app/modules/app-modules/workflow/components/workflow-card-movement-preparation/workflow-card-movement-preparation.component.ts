import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TemplateComunicationItemsDTO } from '@data/models/templates/templates-communication-dto';
import WorkflowEventMailDTO from '@data/models/workflows/workflow-event-mail-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workflow-card-movement-preparation',
  templateUrl: './workflow-card-movement-preparation.component.html',
  styleUrls: ['./workflow-card-movement-preparation.component.scss']
})
export class WorkflowCardMovementPreparationComponent implements OnInit {
  public taskForm: UntypedFormGroup = null;
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
    receivers: marker('emails.receivers')
  };
  public tabsToShow: ('IN' | 'OUT' | 'MOV')[] = [];
  public tabToShow: 'IN' | 'OUT' | 'MOV';
  public sendToOtherWorkflow = false;
  public mainUserSelector = false;
  public emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  constructor(
    public dialogRef: MatDialogRef<WorkflowCardMovementPreparationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      destinationName: string;
      preparation: WorkflowSubstateEventDTO[];
      usersIn: WorkflowSubstateUserDTO[];
      usersOut: WorkflowSubstateUserDTO[];
      view: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS';
      selectedUser: WorkflowSubstateUserDTO;
      mainUserSelector: boolean;
    },
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.usersIn = this.data.usersIn;
    this.usersOut = this.data.usersOut;
    this.usersMov = this.data.usersIn?.length ? this.data.usersIn : this.data.usersOut;
    this.mainUserSelector = this.data.mainUserSelector;
    this.data.preparation.forEach((p: WorkflowSubstateEventDTO) => {
      if (
        p.substateEventType === 'IN' &&
        (p.requiredSize ||
          (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersIn)) ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.tabsToShow.push('IN');
        this.preparationIn = p;
      } else if (
        p.substateEventType === 'OUT' &&
        (p.requiredSize ||
          (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersOut)) ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.tabsToShow.push('OUT');
        this.preparationOut = p;
      } else if (
        p.substateEventType === 'MOV' &&
        (p.requiredSize ||
          (p.requiredUser && !this.findUserIn(this.data.selectedUser, this.usersMov)) ||
          p.sendMail ||
          p.requiredHistoryComment ||
          p.requiredMovementExtra)
      ) {
        this.tabsToShow.push('MOV');
        this.preparationMov = p;
      }
    });
    this.tabToShow = this.tabsToShow[0];
    if (this.data.view === 'MOVES_IN_OTHER_WORKFLOWS') {
      this.sendToOtherWorkflow = true;
    }
    if (this.data.selectedUser?.user?.id && this.findUserIn(this.data.selectedUser, this.usersIn)) {
      this.userInDisabled = true;
    }
    if (this.data.selectedUser?.user?.id && this.findUserIn(this.data.selectedUser, this.usersOut)) {
      this.userOutDisabled = true;
      this.userMovDisabled = true;
    }
    this.initForm();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public tabSelected(event: any) {
    this.tabToShow = this.tabsToShow[event.index];
  }

  public showTab(type: 'IN' | 'OUT' | 'MOV'): boolean {
    if (
      type === 'IN' &&
      this.preparationIn &&
      (!this.preparationIn.requiredMovementExtra ||
        !this.preparationIn.movementExtraAuto ||
        Object.keys(this.preparationInForm?.controls).length > 1)
    ) {
      return true;
    } else if (
      type === 'OUT' &&
      this.preparationOut &&
      (!this.preparationOut.requiredMovementExtra ||
        !this.preparationOut.movementExtraAuto ||
        Object.keys(this.preparationOutForm?.controls).length > 1)
    ) {
      return true;
    } else if (
      type === 'MOV' &&
      this.preparationMov &&
      (!this.preparationMov.requiredMovementExtra ||
        !this.preparationMov.movementExtraAuto ||
        Object.keys(this.preparationMovForm?.controls).length > 1)
    ) {
      return true;
    }
    return false;
  }

  public initForm(): void {
    if (this.sendToOtherWorkflow) {
      this.taskForm = this.fb.group({
        description: [null, Validators.required]
      });
    }
    if (this.mainUserSelector) {
      this.userForm = this.fb.group({
        user: [null, Validators.required]
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
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersIn) : null, [
            Validators.required
          ])
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
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersOut) : null, [
            Validators.required
          ])
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
          this.fb.control(this.data.selectedUser ? this.findUserIn(this.data.selectedUser, this.usersMov) : null, [
            Validators.required
          ])
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
      if (html === '' || html === ' ' || this.convertToPlain(html) === '' || this.convertToPlain(html) === ' ') {
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
    const data = {
      task: this.taskForm ? this.taskForm.value : null,
      user: this.userForm ? this.userForm.value : null,
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
    return this.translateService.instant(this.labels.title, { destination: this.data.destinationName });
  }
}

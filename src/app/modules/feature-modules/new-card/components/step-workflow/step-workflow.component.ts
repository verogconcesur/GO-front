import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardLimitSlotByDayDTO, CardLimitSlotDTO } from '@data/models/workflow-admin/workflow-card-limit-dto';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-step1-workflow',
  templateUrl: './step-workflow.component.html',
  styleUrls: ['./step-workflow.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StepWorkflowComponent implements OnInit {
  @Input() formWorkflow: FormGroup;
  @Input() title: string;
  @Input() currentWorkflowId: number;
  public labels = {
    workflowHeader: marker('newCard.workflow.header'),
    workflowLabel: marker('newCard.workflow.select'),
    facility: marker('newCard.workflow.facility'),
    status: marker('newCard.workflow.states'),
    entryState: marker('newCard.workflow.entryState'),
    subState: marker('newCard.workflow.subState'),
    subStateUser: marker('newCard.workflow.subStateUser'),
    deadLineDate: marker('newCard.workflow.deadLineDate'),
    deadLineHour: marker('newCard.workflow.deadLineHour'),
    required: marker('errors.required'),
    numOf: marker('pagination.pageShortOf')
  };
  public workflowList: WorkflowCreateCardDTO[] = [];
  public facilityList: { id: number; name: string }[] = [];
  public entryStateList: WorkflowStateDTO[] = [];
  public subStateList: WorkflowSubstateDTO[] = [];
  public subStateUsersList: WorkflowSubstateUserDTO[] = [];
  public minDate = new Date();
  public maxDate = new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate());
  public cardsLimits: CardLimitSlotByDayDTO[] = [];
  public maxCardsByHour = 0;
  private datePipe = new DatePipe('en-EN');
  constructor(
    private workflowsService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    private authService: AuthenticationService
  ) {}
  public initialiceList(): void {
    if (
      (this.formWorkflow.get('workflow').value as WorkflowCreateCardDTO)?.workflowCardsLimit?.cardsLimit &&
      this.isContractedModule('cardlimit')
    ) {
      this.formWorkflow.get('cardsLimit').setValue(true);
    } else {
      this.formWorkflow.get('cardsLimit').setValue(false);
    }
    this.facilityList = this.formWorkflow.get('workflow').value ? this.formWorkflow.get('workflow').value.facilities : [];
    const selectedFacility = this.formWorkflow.get('facility').value;
    if (selectedFacility) {
      this.formWorkflow.get('facility').setValue(
        this.facilityList.find((facility: { id: number; name: string }) => facility.id === selectedFacility.id),
        { emitEvent: false }
      );
      if (this.isContractedModule('cardlimit')) {
        this.initialiceLimitDates();
      }
    } else if (this.facilityList.length === 1) {
      this.formWorkflow.get('facility').setValue(this.facilityList[0], { emitEvent: false });
      if (this.isContractedModule('cardlimit')) {
        this.initialiceLimitDates();
      }
    }
    this.setStateAndSubstate();
  }
  public setStateAndSubstate(cardsLimitMode?: boolean): void {
    let selectedEntryState = this.formWorkflow.get('entryState').value;
    if (cardsLimitMode) {
      const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
      this.entryStateList = wf?.workflowCardsLimit?.workflowSubstate
        ? [
            {
              ...wf.workflowCardsLimit.workflowSubstate.workflowState,
              workflowSubstates: [{ ...wf.workflowCardsLimit.workflowSubstate, workflowState: null }]
            }
          ]
        : [];
      selectedEntryState = null;
    } else {
      this.entryStateList = this.formWorkflow.get('workflow').value ? this.formWorkflow.get('workflow').value.workflowStates : [];
    }
    // console.log(this.entryStateList);
    if (selectedEntryState) {
      this.formWorkflow.get('entryState').setValue(
        this.entryStateList.find((entryState: WorkflowStateDTO) => entryState.id === selectedEntryState.id),
        { emitEvent: false }
      );
      this.initialiceSubStates(cardsLimitMode);
    } else if (this.entryStateList.length === 1) {
      this.formWorkflow.get('entryState').setValue(this.entryStateList[0], { emitEvent: false });
      this.initialiceSubStates(cardsLimitMode);
    }
  }
  public isContractedModule(option: string): boolean {
    const configList = this.authService.getConfigList();
    if (option === 'cardlimit') {
      return configList.includes(ModulesConstants.CARD_LIMIT);
    }
  }
  public changeDeadLine(): void {
    const date: Date = this.formWorkflow.get('deadLineDate').value;
    const slot: CardLimitSlotDTO = this.formWorkflow.get('deadLineHour').value;
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    if (date && !this.checkDateDisponibility(date, wf)) {
      this.setStateAndSubstate(true);
    } else if (slot?.maxReached) {
      this.setStateAndSubstate(true);
    } else {
      this.setStateAndSubstate();
    }
  }
  public initialiceLimitDates(): void {
    if (this.isContractedModule('cardlimit')) {
      this.maxCardsByHour = (this.formWorkflow.get('workflow').value as WorkflowCreateCardDTO).workflowCardsLimit?.numCardsByHour;
      const wId = this.formWorkflow.get('workflow').value?.id;
      const fId = this.formWorkflow.get('facility').value?.id;
      this.cardsLimits = [];
      this.formWorkflow.get('deadLineDate').setValue(null);
      this.formWorkflow.get('deadLineHour').setValue(null);
      if (wId && fId) {
        const spinner = this.spinnerService.show();
        this.workflowsService
          .getCardLimitsCreatecardList(wId, fId)
          .pipe(
            take(1),
            finalize(() => {
              this.spinnerService.hide(spinner);
            })
          )
          .subscribe({
            next: (data: CardLimitSlotByDayDTO[]) => {
              this.cardsLimits = data ? data : [];
              const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
              this.cardsLimits.forEach((cl) => {
                const newSlots: CardLimitSlotDTO[] = [];
                for (let x = wf.workflowCardsLimit.initTime; x <= wf.workflowCardsLimit.endTime; x++) {
                  let slot: CardLimitSlotDTO = cl.carLimitSlots.find((c) => c.hourFrom === x);
                  slot = slot
                    ? slot
                    : {
                        cards: 0,
                        hourFrom: x,
                        hourTo: x + 1
                      };
                  slot.maxReached = false;
                  if (slot.cards >= wf.workflowCardsLimit.numCardsByHour) {
                    slot.maxReached = true;
                  }
                  newSlots.push(slot);
                }
                cl.carLimitSlots = newSlots;
              });
            },
            error: (e: ConcenetError) => {
              console.log(e);
            }
          });
      }
    }
  }
  public initialiceSubStates(cardsLimitMode?: boolean): void {
    this.subStateList = this.formWorkflow.get('entryState').value
      ? this.formWorkflow.get('entryState').value.workflowSubstates
      : [];
    const selectedSubState = this.formWorkflow.get('subState').value;
    if (selectedSubState && !cardsLimitMode) {
      this.formWorkflow.get('subState').setValue(
        this.subStateList.find((subState: WorkflowSubstateDTO) => subState.id === selectedSubState.id),
        { emitEvent: false }
      );
      this.initialiceSubStateUsers();
    } else if (this.subStateList.length === 1) {
      this.formWorkflow.get('subState').setValue(this.subStateList[0], { emitEvent: false });
      this.initialiceSubStateUsers();
    }
  }
  public initialiceSubStateUsers(): void {
    this.subStateUsersList = [];
    this.formWorkflow.get('subStateUser').setValue(null);
    this.formWorkflow.get('subStateUser').setValidators([]);
    const wForm = this.formWorkflow.getRawValue();
    if (wForm.entryState && wForm.entryState.front && wForm.workflow.id && wForm.facility.id && wForm.subState.id) {
      this.formWorkflow.get('subStateUser').setValidators([Validators.required]);
      this.workflowsService
        .getSubStateUsers(wForm.workflow.id, wForm.facility.id, wForm.subState.id)
        .pipe(take(1))
        .subscribe((res) => {
          this.subStateUsersList = res;
          if (this.subStateUsersList.length === 1) {
            this.formWorkflow.get('subStateUser').setValue(this.subStateUsersList[0]);
          }
        });
    }
  }
  allowOverLimitCards(): boolean {
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    if (wf.workflowCardsLimit?.cardsLimit && wf.workflowCardsLimit?.allowOverLimit) {
      return true;
    }
    return false;
  }
  hoursList(): CardLimitSlotDTO[] {
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    const day: Date = this.formWorkflow.get('deadLineDate').value;
    if (wf && day) {
      const dString = this.datePipe.transform(day, 'dd/MM/YYYY');
      const dayInfo = this.cardsLimits.filter((cl) => cl.day === dString)[0];
      if (dayInfo?.carLimitSlots?.length) {
        return dayInfo.carLimitSlots;
      } else {
        const newSlots: CardLimitSlotDTO[] = [];
        for (let x = wf.workflowCardsLimit.initTime; x <= wf.workflowCardsLimit.endTime; x++) {
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
  setCardsLimitValue(): void {
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    if (wf?.workflowCardsLimit?.cardsLimit) {
      this.formWorkflow.get('cardsLimit').setValue(true);
    } else {
      this.formWorkflow.get('cardsLimit').setValue(false);
      this.formWorkflow.get('deadLineDate').setValue(null);
      this.formWorkflow.get('deadLineHour').setValue(null);
    }
  }
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const d = cellDate;
      const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
      if (
        d.getFullYear() < new Date().getFullYear() ||
        (d.getFullYear() === new Date().getFullYear() && d.getMonth() < new Date().getMonth()) ||
        (d.getFullYear() === new Date().getFullYear() &&
          d.getMonth() === new Date().getMonth() &&
          d.getDate() < new Date().getDate()) ||
        d.getDay() === 0 ||
        (wf.workflowCardsLimit?.saturdayExcluded && d.getDay() === 6)
      ) {
        return '';
      }
      if (!this.minDaysAdvanceNotice(d)) {
        return '';
      }
      if (wf.workflowCardsLimit?.cardsLimit) {
        return this.checkDateDisponibility(d, wf) ? 'available-date-class' : 'max-reached-date-class';
      }
      return 'available-date-class';
    }
    return '';
  };
  minDaysAdvanceNotice = (d: Date | null): boolean => {
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    if (
      !this.allowOverLimit() &&
      (wf.workflowCardsLimit?.minDaysAdvanceNotice || wf.workflowCardsLimit?.minDaysAdvanceNotice === 0)
    ) {
      const days = wf.workflowCardsLimit?.minDaysAdvanceNotice;
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

  allowOverLimit(): boolean {
    const userRol = this.authService.getUserRole();
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    if (
      wf.workflowCardsLimit?.allowOverLimit &&
      (!wf.workflowCardsLimit.allowOverLimitRoles ||
        wf.workflowCardsLimit.allowOverLimitRoles.length === 0 ||
        wf.workflowCardsLimit.allowOverLimitRoles.find((r) => r.id === userRol.id))
    ) {
      return true;
    }
    return false;
  }
  datesLimitFilter = (d: Date | null): boolean => {
    d = d ? d : new Date();
    const wf: WorkflowCreateCardDTO = this.formWorkflow.get('workflow').value;
    // Prevent Sunday from being selected.
    if (d.getDay() === 0 || (wf.workflowCardsLimit?.saturdayExcluded && d.getDay() === 6) || !this.minDaysAdvanceNotice(d)) {
      return false;
    }
    if (wf.workflowCardsLimit?.cardsLimit && !this.allowOverLimit()) {
      return this.checkDateDisponibility(d, wf);
    }
    return true;
  };
  checkDateDisponibility(d: Date, wf: WorkflowCreateCardDTO): boolean {
    const dString = this.datePipe.transform(d, 'dd/MM/YYYY');
    const dayInfo = this.cardsLimits.filter((cl) => cl.day === dString)[0];
    //Comprobamos que no sobrepase el limite diario
    if (dayInfo && dayInfo.totalCards >= wf.workflowCardsLimit.numCardsByDay) {
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
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.workflowsService
      .getWorkflowsCreatecardList()
      .pipe(take(1))
      .subscribe((res) => {
        this.workflowList = res;
        const selectedWorkflow = this.formWorkflow.get('workflow').value;
        if (selectedWorkflow) {
          this.formWorkflow.get('workflow').setValue(
            this.workflowList.find((workflow: WorkflowCreateCardDTO) => workflow.id === selectedWorkflow.id),
            { emitEvent: false }
          );
          this.initialiceList();
        } else if (this.currentWorkflowId) {
          this.formWorkflow.get('workflow').setValue(
            this.workflowList.find((workflow: WorkflowCreateCardDTO) => workflow.id === this.currentWorkflowId),
            { emitEvent: false }
          );
          if (this.formWorkflow.get('workflow').value) {
            this.initialiceList();
          }
        }
        this.spinnerService.hide(spinner);
      });
  }
}

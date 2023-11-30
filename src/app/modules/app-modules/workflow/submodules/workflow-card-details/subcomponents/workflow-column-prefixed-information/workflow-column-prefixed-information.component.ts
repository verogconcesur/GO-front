import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardInstanceDTO, { CardInstanceInformationDTO } from '@data/models/cards/card-instance-dto';
import WorkflowCardsLimitDTO, { CardLimitSlotDTO } from '@data/models/workflow-admin/workflow-card-limit-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
// eslint-disable-next-line max-len
import { WorkflowCardMovementPreparationComponent } from '@modules/app-modules/workflow/components/workflow-card-movement-preparation/workflow-card-movement-preparation.component';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin, take } from 'rxjs';

@Component({
  selector: 'app-workflow-column-prefixed-information',
  templateUrl: './workflow-column-prefixed-information.component.html',
  styleUrls: ['./workflow-column-prefixed-information.component.scss']
})
export class WorkflowColumnPrefixedInformationComponent implements OnInit {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  public dateLimitToShow: number = null;

  public labels = {
    workOrderInformation: marker('workflows.workOrderInformation'),
    createdOn: marker('common.createdOn'),
    updatedOn: marker('common.updatedOn'),
    origin: marker('common.origin'),
    taskDescription: marker('workflows.taskDescription'),
    tag: marker('workflows.tag'),
    cancel: marker('common.cancel'),
    edit: marker('common.edit'),
    save: marker('common.save'),
    required: marker('errors.required'),
    limitDate: marker('workflows.limitDate')
  };
  public informationForm: FormGroup;
  public dateLimitForm: FormGroup;
  public editMode = false;
  private spinner: string;
  constructor(
    private cardService: CardService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private dialog: MatDialog,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    if (this.cardInstance.cardInstanceWorkflow?.dateAppliTimeLimit) {
      this.dateLimitToShow = this.cardInstance.cardInstanceWorkflow?.dateAppliTimeLimit;
    }
    this.initForm();
  }
  public initForm(): void {
    this.informationForm = this.fb.group({
      instanceInformation: [this.cardInstance.information.instanceInformation],
      tag1: [this.cardInstance.information.tag1],
      tag2: [this.cardInstance.information.tag2],
      tag3: [this.cardInstance.information.tag3]
    });
    this.dateLimitForm = this.fb.group({
      dateLimit: [this.dateLimitToShow]
    });
  }
  public edit() {
    this.editMode = true;
  }
  public cancel() {
    this.editMode = false;
    this.initForm();
  }
  public save() {
    this.spinner = this.spinnerService.show();
    const requests = [];
    if (this.informationForm.valid && this.informationForm.touched) {
      const informationBody = this.informationForm.getRawValue() as CardInstanceInformationDTO;
      requests.push(this.cardService.saveInformation(this.cardInstance.cardInstanceWorkflow.id, informationBody).pipe(take(1)));
    }
    if (this.dateLimitForm.valid && this.dateLimitForm.touched) {
      requests.push(
        this.cardService.changeDateLimit(this.cardInstance.cardInstanceWorkflow.id, this.dateLimitToShow).pipe(take(1))
      );
    }
    forkJoin(requests).subscribe(
      (responses: unknown[]) => {
        this.spinnerService.hide(this.spinner);
        this.editMode = false;
        this.prepareAndMoveService.reloadData$.next('UPDATE_INFORMATION');
      },
      (errors: ConcenetError[]) => {
        this.spinnerService.hide(this.spinner);
        let message = '';
        if (errors.length) {
          errors.forEach((e: ConcenetError) => {
            if (e.message) {
              message = message ? ` - ${e.message}` : e.message;
            }
          });
        }
        if (message) {
          this.globalMessageService.showError({
            message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
        this.editMode = false;
        this.prepareAndMoveService.reloadData$.next('UPDATE_INFORMATION');
      }
    );
  }

  public editDateLimit(): void {
    const workflowCardsLimit: WorkflowCardsLimitDTO = {
      id: 34,
      cardsLimit: true,
      initTime: 11,
      endTime: 13,
      numCardsByHour: 2,
      numCardsByDay: 5,
      allowOverLimit: true,
      workflowSubstate: {
        id: 171,
        workflowState: {
          id: 79,
          workflow: {
            id: 34,
            name: 'Prueba diego contabilidad',
            status: 'PUBLISHED',
            manualCreateCard: true,
            allowAllMovements: true,
            facilities: null
          },
          name: 'Inicial',
          orderNumber: 1,
          front: false,
          anchor: true,
          hideBoard: false,
          color: '#f5f5f5',
          locked: false,
          workflowSubstates: null
        },
        name: 'En espera',
        orderNumber: 1,
        entryPoint: true,
        exitPoint: false,
        hideBoard: false,
        color: '#a59292',
        locked: false,
        workflowSubstateUser: [
          {
            id: 707,
            user: {
              id: 9,
              name: 'contabilidad1',
              firstName: 'Test',
              lastName: 'Demo',
              role: null,
              email: null,
              userName: null,
              password: null,
              permissions: null,
              brands: null,
              facilities: null,
              departments: null,
              specialties: null,
              signature: null,
              signatureContentType: null,
              fullName: 'contabilidad1 Test Demo',
              code: null,
              userType: null,
              dueDatePass: null,
              customer: null,
              userSendPassType: null
            },
            workflowUserId: 159,
            workflowSubstateId: 171,
            permissionType: 'EDIT'
          },
          {
            id: 708,
            user: {
              id: 11,
              name: 'contabilidad3',
              firstName: 'Test',
              lastName: 'Demo',
              role: null,
              email: null,
              userName: null,
              password: null,
              permissions: null,
              brands: null,
              facilities: null,
              departments: null,
              specialties: null,
              signature: null,
              signatureContentType: null,
              fullName: 'contabilidad3 Test Demo',
              code: null,
              userType: null,
              dueDatePass: null,
              customer: null,
              userSendPassType: null
            },
            workflowUserId: 160,
            workflowSubstateId: 171,
            permissionType: 'EDIT'
          },
          {
            id: 715,
            user: {
              id: 1009,
              name: 'Diego Contabilidad',
              firstName: null,
              lastName: null,
              role: null,
              email: null,
              userName: null,
              password: null,
              permissions: null,
              brands: null,
              facilities: null,
              departments: null,
              specialties: null,
              signature: null,
              signatureContentType: null,
              fullName: 'Diego Contabilidad',
              code: null,
              userType: null,
              dueDatePass: null,
              customer: null,
              userSendPassType: null
            },
            workflowUserId: 328,
            workflowSubstateId: 171,
            permissionType: 'EDIT'
          },
          {
            id: 913,
            user: {
              id: 2,
              name: 'adminDemo',
              firstName: 'Test',
              lastName: 'Demo ',
              role: null,
              email: null,
              userName: null,
              password: null,
              permissions: null,
              brands: null,
              facilities: null,
              departments: null,
              specialties: null,
              signature: null,
              signatureContentType: null,
              fullName: 'adminDemo Test Demo ',
              code: null,
              userType: null,
              dueDatePass: null,
              customer: null,
              userSendPassType: null
            },
            workflowUserId: 397,
            workflowSubstateId: 171,
            permissionType: 'EDIT'
          }
        ],
        workflowSubstateEvents: []
      },
      minDaysAdvanceNotice: 5,
      allowOverLimitRoles: []
    };
    this.dialog
      .open(WorkflowCardMovementPreparationComponent, {
        maxWidth: '655px',
        maxHeight: '95vh',
        data: {
          titel: `${this.translateService.instant(this.labels.edit)} ${(
            this.translateService.instant(this.labels.limitDate) as string
          ).toLowerCase()}`,
          workflowDestinatioId: this.cardInstance.workflowId,
          cardIntanceId: this.cardInstance.cardInstanceWorkflow.id,
          forceDateLimit: true,
          workflowCardsLimit
        }
      })
      .afterClosed()
      .pipe(take(1))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((res: { deadLine: { deadLineDate: Date; deadLineHour: CardLimitSlotDTO } }) => {
        if (res?.deadLine?.deadLineDate && res.deadLine.deadLineHour) {
          const date = res.deadLine.deadLineDate as Date;
          const hour = res.deadLine.deadLineHour;
          date.setHours(hour.hourFrom);
          this.dateLimitToShow = +date;
          this.dateLimitForm.get('dateLimit').setValue(this.dateLimitToShow);
          this.dateLimitForm.get('dateLimit').markAsDirty();
          this.dateLimitForm.get('dateLimit').markAsTouched();
        }
      });
  }
}

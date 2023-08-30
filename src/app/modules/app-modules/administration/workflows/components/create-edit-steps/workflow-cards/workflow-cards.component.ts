import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardDTO from '@data/models/cards/card-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
import {
  WorkflowCardsPermissionsComponentModalEnum,
  WorkflowCardsPermissionsComponent
} from './modals/workflow-cards-permissions/workflow-cards-permissions.component';

@Component({
  selector: 'app-workflow-cards',
  templateUrl: './workflow-cards.component.html',
  styleUrls: ['./workflow-cards.component.scss']
})
export class WorkflowCardsComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public labels = {
    cards: marker('common.typeCard'),
    workflows: marker('common.workflows'),
    permissions: marker('workflows.editPermissions')
  };
  public cardsList: CardDTO[] = [];
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    public cardService: CardService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.form = this.fb.group({
      card: [data?.cardData, [Validators.required]]
    });
  }

  public itemIsSelected(card: CardDTO): boolean {
    return this.form.get('card').value && this.form.get('card').value.id === card.id;
  }

  public selectItem(card: CardDTO): void {
    this.form.get('card').setValue(card);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  public editPermissions(): void {
    if (this.originalData.cardData && this.originalData.cardData.id === this.form.get('card').value.id) {
      this.openEditModal();
    } else {
      this.saveStep().then((res) => {
        if (res) {
          this.openEditModal();
        }
      });
    }
  }
  public openEditModal(): void {
    this.customDialogService
      .open({
        id: WorkflowCardsPermissionsComponentModalEnum.ID,
        panelClass: WorkflowCardsPermissionsComponentModalEnum.PANEL_CLASS,
        component: WorkflowCardsPermissionsComponent,
        extendedComponentData: { workflowId: this.workflowId, cardId: this.form.get('card').value.id },
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowCard(this.workflowId).pipe(take(1)),
        this.cardService.getAllCards().pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        (responses: [CardDTO, CardDTO[]]) => {
          this.originalData = {
            cardData: responses[0],
            cardsList: responses[1] ? responses[1] : []
          };
          this.spinnerService.hide(spinner);
          resolve(true);
        },
        (errors) => {
          console.log(errors);
          this.spinnerService.hide(spinner);
        }
      );
    });
  }
  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const listRoles = this.form.getRawValue().card;
      this.workflowService
        .postWorkflowCard(this.workflowId, listRoles)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
            resolve(true);
          })
        )
        .subscribe({
          next: (response) => {
            console.log(response);
          },
          error: (err) => {
            this.logger.error(err);
            resolve(false);
          }
        });
    });
  }
}

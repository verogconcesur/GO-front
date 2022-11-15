import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardDTO from '@data/models/cards/card-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

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
    workflows: marker('common.workflows')
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
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.form = this.fb.group({
      card: [data, [Validators.required]]
    });
    this.originalData = this.form.getRawValue()?.card;
  }

  public itemIsSelected(card: CardDTO): boolean {
    return this.form.get('card').value && this.form.get('card').value.id === card.id;
  }

  public selectItem(card: CardDTO): void {
    this.form.get('card').setValue(card);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.workflowService
        .getWorkflowCard(this.workflowId)
        .pipe(take(1))
        .subscribe((res) => {
          this.initForm(res);
          this.getCardsOptions();
          this.spinnerService.hide(spinner);
          resolve(true);
        });
    });
  }
  public getCardsOptions(): void {
    this.cardService
      .getAllCards()
      .pipe(take(1))
      .subscribe((cards: CardDTO[]) => {
        this.cardsList = cards;
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

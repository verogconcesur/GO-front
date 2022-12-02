import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesBudgetDetailsDTO from '@data/models/templates/templates-budget-details-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { TemplatesBudgetsService } from '@data/services/templates-budgets.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@Component({
  selector: 'app-workflow-budgets',
  templateUrl: './workflow-budgets.component.html',
  styleUrls: ['./workflow-budgets.component.scss']
})
export class WorkflowBudgetsComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public labels = {
    budgets: marker('common.typeBudget'),
    workflows: marker('common.workflows')
  };
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    public budgetService: TemplatesBudgetsService,
    private router: Router,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.form = this.fb.group({
      budget: [data?.budget, [Validators.required]]
    });
  }

  public itemIsSelected(budget: TemplatesCommonDTO): boolean {
    return this.form.get('budget').value && this.form.get('budget').value.template.id === budget.id;
  }

  public selectItem(template: TemplatesCommonDTO): void {
    const spinner = this.spinnerService.show();
    this.budgetService
      .findById(template.id)
      .pipe(take(1))
      .subscribe((budget: TemplatesBudgetDetailsDTO) => {
        this.form.markAsTouched();
        this.form.markAsDirty();
        this.form.get('budget').setValue(budget);
        this.spinnerService.hide(spinner);
      });
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowBudget(this.workflowId).pipe(take(1)),
        this.workflowService.getTemplates(this.workflowId, 'BUDGET').pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        (responses: [TemplatesCommonDTO, TemplatesCommonDTO[]]) => {
          this.originalData = {
            budget: responses[0],
            budgetTemplates: responses[1] ? responses[1] : []
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
      const budget = this.form.getRawValue().budget;
      this.workflowService
        .postWorkflowBudget(this.workflowId, budget)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
            resolve(true);
          })
        )
        .subscribe({
          next: (response) => {
            if (response) {
              this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.ADM_WORKFLOWS]);
            }
          },
          error: (err) => {
            this.logger.error(err);
            resolve(false);
          }
        });
    });
  }
}

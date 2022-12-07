/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../aux-service/workflows-create-edit-aux.service';

/**
 * @abstract @class WorkflowStepAbstractClass
 */
@UntilDestroy()
@Directive()
export abstract class WorkflowStepAbstractClass implements OnInit, OnChanges {
  @Input() abstract workflowId: number;
  @Input() abstract stepIndex: number;
  @Input() lastStep: boolean;
  private useAuxServiceFormCacheActive = false;

  constructor(
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService
  ) {}

  public get originalData(): any {
    return this.workflowsCreateEditAuxService.getFormOriginalData(this.stepIndex);
  }

  public set originalData(data: any) {
    this.workflowsCreateEditAuxService.setFormOriginalData(data, this.stepIndex);
  }

  public get form(): UntypedFormGroup {
    if (this.workflowsCreateEditAuxService.getFormGroupByStep(this.stepIndex)) {
      return this.workflowsCreateEditAuxService.getFormGroupByStep(this.stepIndex);
    } else {
      return null;
    }
  }

  public set form(form: UntypedFormGroup) {
    this.workflowsCreateEditAuxService.setFormGroupByStep(form, this.stepIndex);
  }

  ngOnInit() {
    this.initialLoad();
    this.initListeners();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      this.workflowId &&
      (this.stepIndex || this.stepIndex === 0) &&
      (!this.workflowsCreateEditAuxService.getFormGroupByStep(this.stepIndex) || !this.useAuxServiceFormCacheActive)
    ) {
      await this.getWorkflowStepData();
      this.setFormOriginalValues();
    }
  }

  private initListeners(): void {
    //Save action
    this.workflowsCreateEditAuxService.saveAction$.pipe(untilDestroyed(this)).subscribe(async (nextStep) => {
      if (this.form.valid && this.form.touched && this.form.dirty) {
        this.confirmationDialog
          .open({
            title: this.translateService.instant(marker('common.warning')),
            message: this.translateService.instant(marker('workflows.confirmSave'))
          })
          .pipe(take(1))
          .subscribe(async (ok: boolean) => {
            if (ok) {
              const result = await this.saveStep();
              if (result) {
                this.originalData = this.form.value;
                this.setFormOriginalValues();
                if (nextStep) {
                  this.workflowsCreateEditAuxService.nextStep$.next(true);
                }
              }
            }
          });
      } else if (this.form.valid && !this.form.touched && !this.form.dirty && nextStep && !this.lastStep) {
        this.workflowsCreateEditAuxService.nextStep$.next(true);
      } else if (this.form.valid && !this.form.touched && !this.form.dirty && nextStep && this.lastStep) {
        //Último paso volvemos atrás
        this.workflowsCreateEditAuxService.destroy();
        this.workflowsCreateEditAuxService.goBackToWorkflowsList();
      }
    });
    //ResetForm
    this.workflowsCreateEditAuxService.resetForm$.pipe(untilDestroyed(this)).subscribe(async (data) => {
      this.setFormOriginalValues();
    });
  }

  private initialLoad(): void {
    if (this.useAuxServiceFormCacheActive && this.workflowsCreateEditAuxService.getFormGroupByStep(this.stepIndex)) {
      this.form = this.workflowsCreateEditAuxService.getFormGroupByStep(this.stepIndex);
    } else {
      this.initForm();
    }
  }

  private setFormOriginalValues(): void {
    this.initForm(this.originalData);
  }

  public abstract initForm(data?: any): void;

  public abstract getWorkflowStepData(): Promise<boolean>;

  public abstract saveStep(): Promise<boolean>;
}

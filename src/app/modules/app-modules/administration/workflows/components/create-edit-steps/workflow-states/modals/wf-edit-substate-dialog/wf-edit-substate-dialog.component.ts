import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ResponsiveTabI } from '@shared/components/responsive-tabs/responsive-tabs.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from './aux-service/wf-edit-substate-aux.service';

export const enum WfEditSubstateComponentModalEnum {
  ID = 'edit-substate-dialog-id',
  PANEL_CLASS = 'edit-substate-dialog',
  TITLE = 'workflows.editSubstate'
}
@UntilDestroy()
@Component({
  selector: 'app-wf-edit-substate-dialog',
  templateUrl: './wf-edit-substate-dialog.component.html',
  styleUrls: ['./wf-edit-substate-dialog.component.scss']
})
export class WfEditSubstateDialogComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public tabs: ResponsiveTabI[] = [];
  public tabToShow: ResponsiveTabI;
  public state: WorkflowStateDTO;
  public substate: WorkflowSubstateDTO;
  public workflowId: number;
  private substateModified = false;

  constructor(
    private translateService: TranslateService,
    private dialog: MatDialog,
    private editSubstateAuxService: WEditSubstateFormAuxService,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmationDialog: ConfirmDialogService
  ) {
    super(WfEditSubstateComponentModalEnum.ID, WfEditSubstateComponentModalEnum.PANEL_CLASS, marker('workflows.editSubstate'));
  }

  get form(): UntypedFormGroup {
    return this.editSubstateAuxService.getFormGroupByTab();
  }

  async ngOnInit(): Promise<void> {
    const spinner = this.spinnerService.show();
    this.state = this.extendedComponentData.state;
    this.substate = this.extendedComponentData.substate;
    this.workflowId = this.extendedComponentData.workflowId;
    this.setSubstateTitle();
    this.initTabs();
    await this.editSubstateAuxService.fetchAllStatesSubstatesAndRoles(this.workflowId, this.state, this.substate);
    this.spinnerService.hide(spinner);
  }

  ngOnDestroy(): void {
    this.editSubstateAuxService.destroy();
  }

  public initTabs(): void {
    this.tabs = [
      {
        id: 'GENERAL',
        label: this.translateService.instant('common.general'),
        disabled: () => this.isTabDisabled('GENERAL'),
        disabledTooltip: marker('errors.saveTabBeforeChange')
      },
      {
        id: 'STATE_PERMISSIONS',
        label: this.translateService.instant('workflows.state-permissions'),
        disabled: () => this.isTabDisabled('STATE_PERMISSIONS'),
        disabledTooltip: marker('errors.saveTabBeforeChange')
      },
      {
        id: 'MOVEMENTS',
        label: this.translateService.instant('common.movements'),
        disabled: () => this.isTabDisabled('MOVEMENTS'),
        disabledTooltip: marker('errors.saveTabBeforeChange')
      },
      {
        id: 'EVENTS',
        label: this.translateService.instant('common.events'),
        disabled: () => this.isTabDisabled('EVENTS'),
        disabledTooltip: marker('errors.saveTabBeforeChange')
      }
    ];
  }

  public setSubstateTitle(): void {
    let title = this.translateService.instant(marker('workflows.editSubstate'));
    if (this.state && this.substate) {
      title = `${title} (${this.state.name} / ${this.substate.name})`;
    }
    super.MODAL_TITLE = title;
  }

  public isTabDisabled = (id: string): boolean =>
    this.tabToShow &&
    this.tabToShow?.id !== id &&
    (this.form?.get(this.tabToShow.id)?.touched || this.form?.get(this.tabToShow.id)?.dirty);

  public tabChange(event: ResponsiveTabI): void {
    this.tabToShow = this.tabs.find((tab) => tab.id === event.id);
  }

  public substateChanged(substate: WorkflowSubstateDTO): void {
    this.substate = { ...this.substate, ...substate };
    console.log(this.substate);
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (!this.editSubstateAuxService.isFormGroupSettedAndNotDirtyOrTouched(this.tabToShow.id)) {
      //Formulario sucio solicitamos confirmación
      return this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.unsavedChangesExit'))
        })
        .pipe(take(1));
    }
    return of(true);
  }

  //Para esta modal no lo utilizamos ya que hacemos guardados parciales de los tabs
  // y el botón de cerrar actualiza los datos de la pantalla principal
  public onSubmitCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.close'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'custom',
          label: marker('common.reset'),
          design: 'raised',
          color: '',
          clickFn: () => this.editSubstateAuxService.resetForm$.next(true),
          hiddenFn: () =>
            !(this.form.get(this.tabToShow.id).touched && this.form.get(this.tabToShow.id).dirty) ||
            this.tabToShow?.id === 'MOVEMENTS' ||
            this.tabToShow?.id === 'EVENTS'
        },
        {
          type: 'custom',
          label: marker('common.saveTab'),
          design: 'raised',
          color: 'primary',
          clickFn: () => this.editSubstateAuxService.saveAction$.next(true),
          hiddenFn: () => this.tabToShow?.id === 'MOVEMENTS',
          disabledFn: () =>
            !(
              this.form.get(this.tabToShow.id).touched &&
              this.form.get(this.tabToShow.id).dirty &&
              this.form.get(this.tabToShow.id).valid
            )
        }
      ]
    };
  }
}

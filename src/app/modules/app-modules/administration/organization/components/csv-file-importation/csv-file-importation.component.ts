import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/organization/facility-dto';
import MigrationDTO from '@data/models/organization/migration-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { FacilityService } from '@data/services/facility.sevice';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum CsvFileImportationComponentModalEnum {
  ID = 'csv-file-importation-dialog-id',
  PANEL_CLASS = 'csv-file-importation-dialog',
  TITLE = 'organizations.facilities.import'
}

@Component({
  selector: 'app-csv-file-importation',
  templateUrl: './csv-file-importation.component.html',
  styleUrls: ['./csv-file-importation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CsvFileImportationComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('organizations.facilities.import'),
    select: marker('common.select'),
    insertText: marker('common.insertTextHere'),
    workflow: marker('organizations.facilities.workflow'),
    data: marker('organizations.facilities.importData'),
    fileSelected: marker('organizations.facilities.fileSelected'),
    downloadTemplate: marker('organizations.facilities.downloadTemplate'),
    uploadFile: marker('common.uploadFile'),
    required: marker('errors.required'),
    historic: marker('organizations.facilities.historicImportFile'),
    retryLastMigration: marker('organizations.facilities.retryLastMigration'),
    retryLastMigrationInfo: marker('organizations.facilities.retryLastMigrationInfo')
  };
  public workflowList: WorkflowDTO[];
  public importForm: FormGroup;
  public facility: FacilityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private facilityService: FacilityService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private wfService: WorkflowsService,
    private logger: NGXLogger
  ) {
    super(
      CsvFileImportationComponentModalEnum.ID,
      CsvFileImportationComponentModalEnum.PANEL_CLASS,
      CsvFileImportationComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.facility = this.extendedComponentData;
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {}

  public retryLastMigrationSelected(): boolean {
    return this.importForm?.get('retryLastMigration')?.value ? true : false;
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.importForm?.touched && this.importForm?.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<MigrationDTO | boolean> {
    const formValue = this.importForm.value;
    const spinner = this.spinnerService.show();
    return this.facilityService
      .importFile({
        facilityId: formValue.facility.id,
        workflowId: formValue.workflow.id,
        historic: formValue.historic ? formValue.historic : false,
        retryLastMigration: formValue.retryLastMigration ? formValue.retryLastMigration : false,
        fileToImport: formValue.file
      })
      .pipe(
        map((response) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return response;
        }),
        catchError((error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          return of(false);
        }),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.importForm.valid
        }
      ]
    };
  }

  public addFile(files: FileList): void {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result as string;
      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: result.split(';base64,')[1]
      };
      this.importForm.get('file').setValue(fileInfo);
    };
    reader.readAsDataURL(file);
  }
  public downloadTemplate(): void {
    window.open('/assets/files/TemplateMigration.xlsx', '_blank');
  }
  private getListOptions(): void {
    const spinner = this.spinnerService.show();
    this.wfService
      .searchWorkflows(
        {
          facilities: [this.facility.id],
          brands: [],
          departments: [],
          search: '',
          specialties: [],
          status: 'PUBLISHED'
        },
        { unpaged: true }
      )
      .pipe(take(1))
      .subscribe((res) => {
        this.workflowList = res.content;
        this.spinnerService.hide(spinner);
      });
  }
  private initializeForm(): void {
    this.importForm = this.fb.group({
      facility: [this.facility, [Validators.required]],
      workflow: [null, [Validators.required]],
      historic: [null],
      retryLastMigration: [null],
      file: [null, [Validators.required]]
    });
  }
}

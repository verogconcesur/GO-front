/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import TemplatesCommunicationDTO from '@data/models/templates/templates-communication-dto';
import VariablesDTO from '@data/models/variables-dto';
import { TemplatesCommunicationService } from '@data/services/templates-communication.service';
import { VariablesService } from '@data/services/variables.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditCommunicationComponentModalEnum {
  ID = 'create-edit-communication-dialog-id',
  PANEL_CLASS = 'create-edit-communication-dialog',
  TITLE = 'administration.templates.communications.add'
}

@Component({
  selector: 'app-create-edit-communication',
  templateUrl: './create-edit-communication.component.html',
  styleUrls: ['./create-edit-communication.component.scss']
})
export class CreateEditCommunicationComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('administration.templates.communications.add'),
    name: marker('administration.templates.communications.name'),
    organization: marker('userProfile.organization'),
    edit: marker('administration.templates.communications.edit'),
    text: marker('administration.templates.communications.text'),
    data: marker('userProfile.data'),
    insertText: marker('common.insertTextHere'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required')
  };
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true,
    addMacroListOption: true,
    macroListOptions: []
  };
  public listVariables: VariablesDTO[];
  public communicationForm: UntypedFormGroup;
  public communicationTemplateForm: UntypedFormGroup;
  public communicationToEdit: TemplatesCommunicationDTO = null;
  public startDate: Date;
  public endDate: Date;
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private communicationService: TemplatesCommunicationService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private variablesService: VariablesService
  ) {
    super(
      CreateEditCommunicationComponentModalEnum.ID,
      CreateEditCommunicationComponentModalEnum.PANEL_CLASS,
      CreateEditCommunicationComponentModalEnum.TITLE
    );
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.communicationForm.controls;
  }

  ngOnInit(): void {
    this.communicationToEdit = this.extendedComponentData;
    this.getVariable();
    this.initializeForm();
    if (this.communicationToEdit) {
      this.MODAL_TITLE = marker('administration.templates.communications.edit');
    }
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.communicationForm.touched && this.communicationForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesCommunicationDTO> {
    const formValue = this.communicationForm.getRawValue();
    const variablesOnText = this.listVariables.filter(
      (variable) => formValue.text && formValue.text.indexOf(variable.name) !== -1
    );
    formValue.variables = variablesOnText;
    if (this.communicationToEdit) {
      formValue.id = this.communicationToEdit.id;
      formValue.template.id = this.communicationToEdit.template.id;
    }
    formValue.template = {
      ...formValue.template,
      brands: formValue.template.brands.map((brand: BrandDTO) => ({ id: brand.id })),
      departments: formValue.template.departments.map((dep: DepartmentDTO) => ({ id: dep.id })),
      facilities: formValue.template.facilities.map((fac: FacilityDTO) => ({ id: fac.id })),
      specialties: formValue.template.specialties.map((spe: SpecialtyDTO) => ({ id: spe.id }))
    };
    const spinner = this.spinnerService.show();
    return this.communicationService.addOrEditCommunication(formValue).pipe(
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
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('administration.templates.communications.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteCommunication,
          hiddenFn: () => !this.communicationToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          //TODO: tener en cuenta templateBudgetLines
          disabledFn: () => !(this.communicationForm.touched && this.communicationForm.dirty && this.communicationForm.valid)
        }
      ]
    };
  }

  public textEditorContentChanged(html: string) {
    if (html !== this.form.text.value) {
      this.communicationForm.get('text').setValue(html, { emitEvent: true });
      this.communicationForm.get('text').markAsDirty();
      this.communicationForm.get('text').markAsTouched();
    }
  }

  private deleteCommunication = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.communications.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.communicationService
            .deleteCommunicationById(this.communicationToEdit.template.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private getVariable(): void {
    this.variablesService.searchVariables().subscribe((res) => {
      this.textEditorToolbarOptions.macroListOptions = res.map((item: VariablesDTO) => item.name);
      this.listVariables = res;
    });
  }

  private initializeForm(): void {
    this.communicationForm = this.fb.group({
      template: this.fb.group({
        name: [this.communicationToEdit ? this.communicationToEdit.template.name : null, Validators.required],
        brands: [this.communicationToEdit ? this.communicationToEdit.template.brands : null, Validators.required],
        facilities: [this.communicationToEdit ? this.communicationToEdit.template.facilities : null, Validators.required],
        departments: [this.communicationToEdit ? this.communicationToEdit.template.departments : null, Validators.required],
        specialties: [this.communicationToEdit ? this.communicationToEdit.template.specialties : null, Validators.required]
      }),
      text: [this.communicationToEdit ? this.communicationToEdit.text : null, Validators.required],
      variables: [this.communicationToEdit ? this.communicationToEdit.variables : []]
    });
  }
}

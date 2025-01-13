/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import TemplatesCommunicationDTO, {
  CommunicationTypes,
  TemplateComunicationItemsDTO
} from '@data/models/templates/templates-communication-dto';
import VariablesDTO from '@data/models/variables-dto';
import { TemplatesCommunicationService } from '@data/services/templates-communication.service';
import { VariablesService } from '@data/services/variables.service';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

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
    templateCodeWhatsApp: marker('administration.templates.communications.templateCodeWhatsApp'),
    text: marker('administration.templates.communications.text'),
    subject: marker('administration.templates.communications.subject'),
    communicationType: marker('administration.templates.communications.communicationType'),
    user: marker('common.communicationTypes.user'),
    customer: marker('common.communicationTypes.customer'),
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
  public textEditorToolbarOnlyMacroOptions: TextEditorWrapperConfigI = {
    onlyMacroOption: true,
    addMacroListOption: true,
    macroListOptions: []
  };
  public listVariables: VariablesDTO[];
  public listCustomVariables: VariablesDTO[];
  public communicationForm: UntypedFormGroup;
  public communicationTemplateForm: UntypedFormGroup;
  public communicationToEdit: TemplatesCommunicationDTO = null;
  public messageChannels: MessageChannelDTO[] = [];
  public communicationTypes = CommunicationTypes;
  public startDate: Date;
  public endDate: Date;
  public shouldShowWhatsAppField = false;
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

  get comItems(): FormArray {
    return this.communicationForm.get('templateComunicationItems') as FormArray;
  }
  ngOnInit(): void {
    this.communicationToEdit = this.extendedComponentData;
    this.getVariable();
    this.communicationService
      .getMessageChannels()
      .pipe(take(1))
      .subscribe((res) => {
        this.messageChannels = res;
        this.initializeForm();
      });
    if (this.communicationToEdit) {
      this.MODAL_TITLE = marker('administration.templates.communications.edit');
    }
  }

  ngOnDestroy(): void {}
  public getTabLabel(item: FormGroup): string {
    const validator = item.controls.text.validator ? item.controls.text.validator({} as AbstractControl) : null;
    if (validator && validator.required) {
      return item.value.messageChannel.name + '*';
    } else {
      return item.value.messageChannel.name;
    }
  }
  public changeComunicationType(): void {
    if (
      this.communicationForm.get('comunicationType') &&
      this.communicationForm.get('comunicationType').value === this.communicationTypes[1].value
    ) {
      this.communicationForm.get('templateComunicationItems').get('0').get('text').setValidators([Validators.required]);
    } else {
      this.communicationForm.get('templateComunicationItems').get('0').get('text').setValidators([]);
    }
  }
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
    const variablesOnText = this.listVariables.filter((variable) => {
      let variableUsed = false;
      formValue.templateComunicationItems.forEach((item: TemplateComunicationItemsDTO) => {
        if (item.text && item.text.indexOf(variable.name) !== -1) {
          variableUsed = true;
        }
        if (item.subject && item.subject.indexOf(variable.name) !== -1) {
          variableUsed = true;
        }
      });
      return variableUsed;
    });
    formValue.variables = variablesOnText;
    const customVariablesOnText = this.listCustomVariables.filter((customVariable) => {
      let customVariableUsed = false;
      formValue.templateComunicationItems.forEach((item: TemplateComunicationItemsDTO) => {
        if (item.text && item.text.indexOf(customVariable.name) !== -1) {
          customVariableUsed = true;
        }
        if (item.subject && item.subject.indexOf(customVariable.name) !== -1) {
          customVariableUsed = true;
        }
      });
      return customVariableUsed;
    });
    formValue.tabItems = customVariablesOnText;
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
    formValue.templateComunicationItems = formValue.templateComunicationItems.filter(
      (item: TemplateComunicationItemsDTO) => item.text
    );
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
          disabledFn: () =>
            !(
              this.communicationForm &&
              this.communicationForm.touched &&
              this.communicationForm.dirty &&
              this.communicationForm.valid
            )
        }
      ]
    };
  }
  public onTabChange(event: MatTabChangeEvent) {
    const selectedTabIndex = event.index;
    const selectedItem = this.comItems.controls[selectedTabIndex];

    if (selectedItem && selectedItem.value.messageChannel.id === 4) {
      this.shouldShowWhatsAppField = true;
      this.communicationForm.get('templateComunicationItems').get('3').get('contentSid').setValidators([Validators.required]);
    } else {
      this.shouldShowWhatsAppField = false;
      this.communicationForm.get('templateComunicationItems').get('3').get('contentSid').clearValidators();
    }
    this.communicationForm.get('templateComunicationItems').get('3').get('contentSid').updateValueAndValidity();
  }

  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }
  public textEditorContentChanged(html: string, form: FormControl, plain?: boolean) {
    if (html !== form.value) {
      if (plain) {
        html = this.convertToPlain(html);
      }
      if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
        html = null;
      }
      form.setValue(html, { emitEvent: true });
      this.communicationForm.markAsDirty();
      this.communicationForm.markAsTouched();
    }
  }

  private deleteCommunication = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.communications.deleteConfirmation'))
      })
      .pipe(take(1))
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

  // private getVariable(): void {
  //   this.variablesService
  //     .searchVariables()
  //     .pipe(take(1))
  //     .subscribe((res) => {
  //       this.textEditorToolbarOptions.macroListOptions = res.map((item: VariablesDTO) => item.name);
  //       this.textEditorToolbarOnlyMacroOptions.macroListOptions = this.textEditorToolbarOptions.macroListOptions;
  //       this.listVariables = res;
  //     });
  // }
  private getVariable(): void {
    forkJoin({
      variables: this.variablesService.searchVariables().pipe(take(1)),
      customVariables: this.variablesService.searchCustomVariables().pipe(take(1))
    }).subscribe((res) => {
      const variables = res.variables;
      const customVariables = res.customVariables;
      const allVariables = variables.concat(customVariables);
      const sortedVariables = allVariables.sort((a: VariablesDTO, b: VariablesDTO) => a.name.localeCompare(b.name));
      this.textEditorToolbarOptions.macroListOptions = sortedVariables.map((item: VariablesDTO) => item.name);
      this.textEditorToolbarOnlyMacroOptions.macroListOptions = this.textEditorToolbarOptions.macroListOptions;
      this.listVariables = variables;
      this.listCustomVariables = customVariables;
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
      comunicationType: [this.communicationToEdit ? this.communicationToEdit.comunicationType : null],
      variables: [this.communicationToEdit ? this.communicationToEdit.variables : []],
      templateComunicationItems: this.fb.array([])
    });
    this.messageChannels.forEach((messageChannel: MessageChannelDTO) => {
      let editItem;
      if (this.communicationToEdit && this.communicationToEdit.templateComunicationItems) {
        editItem = this.communicationToEdit.templateComunicationItems.find(
          (communicationItem: TemplateComunicationItemsDTO) => communicationItem.messageChannel.id === messageChannel.id
        );
      }
      (this.communicationForm.get('templateComunicationItems') as FormArray).push(
        this.fb.group({
          id: [editItem ? editItem.id : null],
          text: [editItem ? editItem.text : '', messageChannel.id === 1 ? Validators.required : null],
          subject: [editItem ? editItem.subject : ''],
          messageChannel: [messageChannel],
          contentSid: [editItem ? editItem.contentSid : null]
        })
      );
    });
    this.changeComunicationType();
  }
}

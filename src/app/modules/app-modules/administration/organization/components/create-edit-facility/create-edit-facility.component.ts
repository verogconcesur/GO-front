/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO, { ConfigStockSubstate } from '@data/models/organization/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
// eslint-disable-next-line max-len
import { MatMenuTrigger } from '@angular/material/menu';
import TreeNode from '@data/interfaces/tree-node';
import CountryDTO from '@data/models/location/country-dto';
import ProvinceDTO from '@data/models/location/province-dto';
import TownDTO from '@data/models/location/town-dto';
import BrandDTO from '@data/models/organization/brand-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { BrandService } from '@data/services/brand.service';
import { LocalityService } from '@data/services/locality.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { validateConfigMailers } from '@shared/validators/configEmail-required-fields.validator';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditFacilityComponentModalEnum {
  ID = 'create-edit-facility-dialog-id',
  PANEL_CLASS = 'create-edit-facility-dialog',
  TITLE = 'organizations.facilities.create'
}

@UntilDestroy()
@Component({
  selector: 'app-create-edit-facility',
  templateUrl: './create-edit-facility.component.html',
  styleUrls: ['./create-edit-facility.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditFacilityComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  @ViewChild('menuTriggerNew') triggerNew: MatMenuTrigger;
  @ViewChild('menuTriggerUsed') triggerUsed: MatMenuTrigger;
  public labels = {
    title: marker('organizations.facilities.create'),
    name: marker('userProfile.name'),
    configMailerUserName: marker('userProfile.userName'),
    configMailerPass: marker('login.password'),
    createFacility: marker('organizations.facilities.create'),
    editFacility: marker('organizations.facilities.edit'),
    address: marker('common.address'),
    integration: marker('organizations.facilities.integration'),
    requireConfigApiExt: marker('organizations.facilities.requireConfigApiExt'),
    configApiExtDefault: marker('organizations.facilities.configApiExtDefault'),
    requireConfigStockApiExt: marker('organizations.facilities.requireConfigStockApiExt'),
    requireConfigEmail: marker('organizations.facilities.requireConfigEmail'),
    configApiExtType: marker('organizations.facilities.configApiExtType'),
    configApiExtDmsType: marker('organizations.facilities.configApiExtDmsType'),
    configApiExtCsvHost: marker('organizations.facilities.configApiExtCsvHost'),
    configApiExtCsvPort: marker('organizations.facilities.configApiExtCsvPort'),
    configApiExtCsvDirectory: marker('organizations.facilities.configApiExtCsvDirectory'),
    configApiExtCsvPrefixFile: marker('organizations.facilities.configApiExtCsvPrefixFile'),
    configApiExtCsvUser: marker('organizations.facilities.configApiExtCsvUser'),
    configApiExtCsvPass: marker('organizations.facilities.configApiExtCsvPass'),
    configStockType: marker('organizations.facilities.configStockType'),
    configStockCsvHost: marker('organizations.facilities.configStockCsvHost'),
    configStockCsvPort: marker('organizations.facilities.configStockCsvPort'),
    configStockCsvDirectory: marker('organizations.facilities.configStockCsvDirectory'),
    configStockCsvPrefixFile: marker('organizations.facilities.configStockCsvPrefixFile'),
    configStockCsvUser: marker('organizations.facilities.configStockCsvUser'),
    configStockCsvPass: marker('organizations.facilities.configStockCsvPass'),
    code: marker('organizations.facilities.code'),
    enterpriseId: marker('organizations.facilities.enterpriseId'),
    storeId: marker('organizations.facilities.storeId'),
    workflowSubstate: marker('organizations.facilities.substateConfig'),
    workflowSubstateNew: marker('organizations.facilities.substateConfigNew'),
    workflowSubstateUsed: marker('organizations.facilities.substateConfigUsed'),
    saveAndLoadCsvFile: marker('organizations.facilities.saveAndLoadCsvFile'),
    postalCode: marker('common.postalCode'),
    brands: marker('common.brands'),
    cif: marker('common.cif'),
    email: marker('userProfile.email'),
    country: marker('common.country'),
    province: marker('common.province'),
    town: marker('common.town'),
    data: marker('userProfile.data'),
    emails: marker('common.emails'),
    confEmail: marker('common.confEmail'),
    header: marker('common.header'),
    configMailerHost: marker('common.host'),
    configMailerPort: marker('common.port'),
    nameRequired: marker('userProfile.nameRequired'),
    select: marker('common.select'),
    footer: marker('common.footer'),
    insertText: marker('common.insertTextHere'),
    required: marker('errors.required'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    emailError: marker('errors.emailPattern'),
    minLength: marker('errors.minLength'),
    maxLength: marker('errors.maxLengthError'),
    confSms: marker('common.confSms'),
    configSmsSender: marker('common.configSmsSender'),
    confWhatsapp: marker('common.confWhatsapp'),
    phoneWhatsapp: marker('common.phoneWhatsapp'),
    senderWhatsapp: marker('common.senderWhatsapp'),
    confTpv: marker('tpv.confTpv'),
    keyCommerce: marker('tpv.keyCommerce'),
    tpvCode: marker('tpv.tpvCode'),
    tpvTerminal: marker('tpv.tpvTerminal')
  };
  public minLength = 3;
  public maxLength = 11;
  public organizationLevelsToShow = { specialties: false, departments: false, facilities: false };
  public countryAsyncList: Observable<CountryDTO[]>;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public countryList: CountryDTO[] = [];
  public provinceList: ProvinceDTO[] = [];
  public townList: TownDTO[] = [];
  public substateList: WorkflowSubstateDTO[] = [];
  public facilityForm: UntypedFormGroup;
  public facilityToEdit: FacilityDTO = null;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true
    // addMacroListOption: false,
    // macroListOptions: ['una', 'dos']
  };
  public treeData: TreeNode[] = [];
  public configType = [
    { name: 'DMS', value: 'DMS' },
    { name: 'CSV', value: 'CSV' }
  ];
  public configDmsType = [
    { name: 'KEYLOOP', value: 'AUTOLINE' },
    { name: 'SPIGA', value: 'SPIGA' }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private facilityService: FacilityService,
    private brandService: BrandService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private localityService: LocalityService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    private logger: NGXLogger
  ) {
    super(
      CreateEditFacilityComponentModalEnum.ID,
      CreateEditFacilityComponentModalEnum.PANEL_CLASS,
      CreateEditFacilityComponentModalEnum.TITLE
    );
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.facilityForm.controls;
  }

  ngOnInit(): void {
    this.facilityToEdit = this.extendedComponentData;
    if (this.facilityToEdit) {
      this.MODAL_TITLE = this.labels.editFacility;
    }
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {}
  public requiredConfigChange(checked: boolean): void {
    if (checked) {
      this.facilityForm.get('configApiExtType').setValidators([Validators.required]);
      const configTypeControl = this.facilityForm.get('configApiExtType');

      configTypeControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
        if (value === 'CSV') {
          this.facilityForm.get('configApiExtCsvHost').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtCsvPort').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtCsvDirectory').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtCsvPrefixFile').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtCsvUser').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtCsvPass').setValidators([Validators.required]);

          this.facilityForm.get('code').clearValidators();
          this.facilityForm.get('enterpriseId').clearValidators();
          this.facilityForm.get('storeId').clearValidators();
          this.facilityForm.get('configApiExtDmsType').clearValidators();
        } else if (value === 'DMS') {
          this.facilityForm.get('code').setValidators([Validators.required]);
          this.facilityForm.get('enterpriseId').setValidators([Validators.required]);
          this.facilityForm.get('storeId').setValidators([Validators.required]);
          this.facilityForm.get('configApiExtDmsType').setValidators([Validators.required]);

          this.facilityForm.get('configApiExtCsvHost').clearValidators();
          this.facilityForm.get('configApiExtCsvPort').clearValidators();
          this.facilityForm.get('configApiExtCsvDirectory').clearValidators();
          this.facilityForm.get('configApiExtCsvPrefixFile').clearValidators();
          this.facilityForm.get('configApiExtCsvUser').clearValidators();
          this.facilityForm.get('configApiExtCsvPass').clearValidators();
        }

        this.facilityForm.get('configApiExtCsvHost').updateValueAndValidity();
        this.facilityForm.get('configApiExtCsvPort').updateValueAndValidity();
        this.facilityForm.get('configApiExtCsvDirectory').updateValueAndValidity();
        this.facilityForm.get('configApiExtCsvPrefixFile').updateValueAndValidity();
        this.facilityForm.get('configApiExtCsvUser').updateValueAndValidity();
        this.facilityForm.get('configApiExtCsvPass').updateValueAndValidity();
        this.facilityForm.get('code').updateValueAndValidity();
        this.facilityForm.get('enterpriseId').updateValueAndValidity();
        this.facilityForm.get('storeId').updateValueAndValidity();
        this.facilityForm.get('configApiExtDmsType').updateValueAndValidity();
      });
    } else {
      this.facilityForm.get('configApiExtType').clearValidators();
      this.facilityForm.get('configApiExtType').setValue(null);

      this.facilityForm.get('code').clearValidators();
      this.facilityForm.get('enterpriseId').clearValidators();
      this.facilityForm.get('storeId').clearValidators();
      this.facilityForm.get('configApiExtDmsType').clearValidators();
      this.facilityForm.get('configApiExtCsvHost').clearValidators();
      this.facilityForm.get('configApiExtCsvPort').clearValidators();
      this.facilityForm.get('configApiExtCsvDirectory').clearValidators();
      this.facilityForm.get('configApiExtCsvPrefixFile').clearValidators();
      this.facilityForm.get('configApiExtCsvUser').clearValidators();
      this.facilityForm.get('configApiExtCsvPass').clearValidators();

      this.facilityForm.get('configApiExtType').setValue(null);
      this.facilityForm.get('configApiExtCsvHost').setValue(null);
      this.facilityForm.get('configApiExtCsvPort').setValue(null);
      this.facilityForm.get('configApiExtCsvDirectory').setValue(null);
      this.facilityForm.get('configApiExtCsvPrefixFile').setValue(null);
      this.facilityForm.get('configApiExtCsvUser').setValue(null);
      this.facilityForm.get('configApiExtCsvPass').setValue(null);
      this.facilityForm.get('code').setValue(null);
      this.facilityForm.get('enterpriseId').setValue(null);
      this.facilityForm.get('storeId').setValue(null);
      this.facilityForm.get('configApiExtDmsType').setValue(null);
      this.facilityForm.get('workflowSubstate').setValue(null);
    }

    this.facilityForm.get('configApiExtType').updateValueAndValidity();
  }

  public requiredConfigChangeStock(checked: boolean): void {
    if (checked) {
      this.facilityForm.get('configStockType').setValidators([Validators.required]);

      const stockTypeControl = this.facilityForm.get('configStockType');

      stockTypeControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
        if (value === 'CSV') {
          this.facilityForm.get('configStockCsvHost').setValidators([Validators.required]);
          this.facilityForm.get('configStockCsvPort').setValidators([Validators.required]);
          this.facilityForm.get('configStockCsvDirectory').setValidators([Validators.required]);
          this.facilityForm.get('configStockCsvPrefixFile').setValidators([Validators.required]);
          this.facilityForm.get('configStockCsvUser').setValidators([Validators.required]);
          this.facilityForm.get('configStockCsvPass').setValidators([Validators.required]);

          this.facilityForm.get('configStockCode').clearValidators();
          this.facilityForm.get('configStockEnterpriseId').clearValidators();
          this.facilityForm.get('configStockStoreId').clearValidators();
        } else if (value === 'DMS') {
          this.facilityForm.get('configStockCode').setValidators([Validators.required]);
          this.facilityForm.get('configStockEnterpriseId').setValidators([Validators.required]);
          this.facilityForm.get('configStockStoreId').setValidators([Validators.required]);

          this.facilityForm.get('configStockCsvHost').clearValidators();
          this.facilityForm.get('configStockCsvPort').clearValidators();
          this.facilityForm.get('configStockCsvDirectory').clearValidators();
          this.facilityForm.get('configStockCsvPrefixFile').clearValidators();
          this.facilityForm.get('configStockCsvUser').clearValidators();
          this.facilityForm.get('configStockCsvPass').clearValidators();
        }

        this.facilityForm.get('configStockCsvHost').updateValueAndValidity();
        this.facilityForm.get('configStockCsvPort').updateValueAndValidity();
        this.facilityForm.get('configStockCsvDirectory').updateValueAndValidity();
        this.facilityForm.get('configStockCsvPrefixFile').updateValueAndValidity();
        this.facilityForm.get('configStockCsvUser').updateValueAndValidity();
        this.facilityForm.get('configStockCsvPass').updateValueAndValidity();
        this.facilityForm.get('configStockCode').updateValueAndValidity();
        this.facilityForm.get('configStockEnterpriseId').updateValueAndValidity();
        this.facilityForm.get('configStockStoreId').updateValueAndValidity();
      });
    } else {
      this.facilityForm.get('configStockType').clearValidators();
      this.facilityForm.get('configStockType').setValue(null);

      this.facilityForm.get('configStockCode').clearValidators();
      this.facilityForm.get('configStockEnterpriseId').clearValidators();
      this.facilityForm.get('configStockStoreId').clearValidators();
      this.facilityForm.get('configStockCsvHost').clearValidators();
      this.facilityForm.get('configStockCsvPort').clearValidators();
      this.facilityForm.get('configStockCsvDirectory').clearValidators();
      this.facilityForm.get('configStockCsvPrefixFile').clearValidators();
      this.facilityForm.get('configStockCsvUser').clearValidators();
      this.facilityForm.get('configStockCsvPass').clearValidators();

      this.facilityForm.get('configStockCode').setValue(null);
      this.facilityForm.get('configStockEnterpriseId').setValue(null);
      this.facilityForm.get('configStockStoreId').setValue(null);
      this.facilityForm.get('configStockType').setValue(null);
      this.facilityForm.get('configStockCsvHost').setValue(null);
      this.facilityForm.get('configStockCsvPort').setValue(null);
      this.facilityForm.get('configStockCsvDirectory').setValue(null);
      this.facilityForm.get('configStockCsvPrefixFile').setValue(null);
      this.facilityForm.get('configStockCsvUser').setValue(null);
      this.facilityForm.get('configStockCsvPass').setValue(null);

      this.facilityForm.get('workflowSubstateNew').setValue(null);
      this.facilityForm.get('workflowSubstateUsed').setValue(null);

      const configStockSubstates = this.facilityForm.get('configStockSubstates').value;
      if (configStockSubstates) {
        //@ts-ignore
        configStockSubstates.forEach((state) => {
          state.workflowSubstate = null;
        });
        this.facilityForm.get('configStockSubstates').setValue(configStockSubstates);
      }
    }
    this.facilityForm.get('configStockType').updateValueAndValidity();
  }

  public removeSubstate(): void {
    this.facilityForm.get('workflowSubstate').setValue(null);
  }

  public removeStockSubstate(inventoryType: 'NEW' | 'USED'): void {
    if (inventoryType === 'NEW') {
      this.facilityForm.get('workflowSubstateNew').setValue(null);
    } else if (inventoryType === 'USED') {
      this.facilityForm.get('workflowSubstateUsed').setValue(null);
    }
    this.updateConfigStockSubstates(inventoryType, null);
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.facilityForm?.touched && this.facilityForm?.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }
  public selectAttribute(node: WorkflowSubstateDTO): void {
    this.facilityForm.get('workflowSubstate').setValue(
      this.substateList.find((substate: WorkflowSubstateDTO) => substate.id === node.id),
      { emitEvent: false }
    );
    this.facilityForm.get('workflowSubstate').markAsDirty();
    this.facilityForm.get('workflowSubstate').markAsTouched();
    this.trigger.closeMenu();
  }

  selectAttributeNew(node: WorkflowSubstateDTO): void {
    const selectedSubstate = this.substateList.find((substate: WorkflowSubstateDTO) => substate.id === node.id);
    this.facilityForm.get('workflowSubstateNew').setValue(selectedSubstate, { emitEvent: false });
    this.facilityForm.get('workflowSubstateNew').markAsDirty();
    this.facilityForm.get('workflowSubstateNew').markAsTouched();
    this.updateConfigStockSubstates('NEW', selectedSubstate);
    this.triggerNew.closeMenu();
  }

  selectAttributeUsed(node: WorkflowSubstateDTO): void {
    const selectedSubstate = this.substateList.find((substate: WorkflowSubstateDTO) => substate.id === node.id);
    this.facilityForm.get('workflowSubstateUsed').setValue(selectedSubstate, { emitEvent: false });
    this.facilityForm.get('workflowSubstateUsed').markAsDirty();
    this.facilityForm.get('workflowSubstateUsed').markAsTouched();
    this.updateConfigStockSubstates('USED', selectedSubstate);
    this.triggerUsed.closeMenu();
  }

  public onSubmitCustomDialog(): Observable<boolean | FacilityDTO> {
    const formValue = this.facilityForm.value;
    const spinner = this.spinnerService.show();
    return this.facilityService
      .addFacility({
        address: formValue.address,
        brands: formValue.brands,
        cif: formValue.cif,
        email: formValue.email,
        footer: formValue.footer ? formValue.footer : null,
        header: formValue.header ? formValue.header : null,
        id: formValue.id,
        name: formValue.name,
        numDepartments: formValue.numDepartments,
        postalCode: formValue.postalCode,
        town: formValue.town,
        requireConfigApiExt: formValue.requireConfigApiExt,
        configApiExtDmsType: formValue.configApiExtDmsType,
        // configApiExtDefault: Instalación por defecto autoline
        // configApiExtDefault: formValue.configApiExtDefault,
        code: formValue.code,
        enterpriseId: formValue.enterpriseId,
        storeId: formValue.storeId,
        configApiExtType: formValue.configApiExtType,
        configApiExtCsvHost: formValue.configApiExtCsvHost,
        configApiExtCsvPort: formValue.configApiExtCsvPort,
        configApiExtCsvDirectory: formValue.configApiExtCsvDirectory,
        configApiExtCsvPrefixFile: formValue.configApiExtCsvPrefixFile,
        configApiExtCsvUser: formValue.configApiExtCsvUser,
        configApiExtCsvPass: formValue.configApiExtCsvPass,
        configStockType: formValue.configStockType,
        configStockCsvHost: formValue.configStockCsvHost,
        configStockCsvPort: formValue.configStockCsvPort,
        configStockCsvDirectory: formValue.configStockCsvDirectory,
        configStockCsvPrefixFile: formValue.configStockCsvPrefixFile,
        configStockCsvUser: formValue.configStockCsvUser,
        configStockCsvPass: formValue.configStockCsvPass,
        workflowSubstate: formValue.workflowSubstate,
        requireConfigStockApiExt: formValue.requireConfigStockApiExt,
        configStockCode: formValue.configStockCode,
        configStockEnterpriseId: formValue.configStockEnterpriseId,
        configStockStoreId: formValue.configStockStoreId,
        configStockSubstates: formValue.requireConfigStockApiExt
          ? this.checkAndFilterConfigStockSubstates(formValue.configStockSubstates)
          : null,
        configMailerHost: formValue.configMailerHost,
        configMailerPort: formValue.configMailerPort,
        configMailerUserName: formValue.configMailerUserName,
        configMailerPass: formValue.configMailerPass,
        senderSms: formValue.senderSms,
        whatsappPhoneNumber: formValue.whatsappPhoneNumber,
        whatsappSender: formValue.whatsappSender,
        keyCommerce: formValue.keyCommerce,
        tpvCode: formValue.tpvCode,
        tpvTerminal: formValue.tpvTerminal
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
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('organizations.facilities.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteFacility,
          hiddenFn: () => !this.facilityToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.facilityForm.touched && this.facilityForm.dirty && this.facilityForm.valid)
        }
      ]
    };
  }

  public deleteFacility = (): void => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.facilities.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.facilityService
            .deleteFacility(this.facilityToEdit.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: () => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error: ConcenetError) => {
                console.log(error);
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };
  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }
  public textEditorContentChanged(type: 'header' | 'footer', html: string) {
    if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
      html = null;
    }
    if (type === 'header' && html !== this.form.header.value) {
      this.facilityForm.get('header').setValue(html, { emitEvent: true });
      this.facilityForm.get('header').markAsDirty();
      this.facilityForm.get('header').markAsTouched();
    } else if (type === 'footer' && html !== this.form.footer.value) {
      this.facilityForm.get('footer').setValue(html, { emitEvent: true });
      this.facilityForm.get('footer').markAsDirty();
      this.facilityForm.get('footer').markAsTouched();
    }
  }

  public saveAndLoadFileCSV(type: string): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.facilities.modalLabelSaveAndLoadCsvFile'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const formValue = this.facilityForm.value;
          const spinner = this.spinnerService.show();
          this.facilityService
            .saveAndLoadCSVFile(
              {
                address: formValue.address,
                brands: formValue.brands,
                cif: formValue.cif,
                email: formValue.email,
                footer: formValue.footer ? formValue.footer : null,
                header: formValue.header ? formValue.header : null,
                id: formValue.id,
                name: formValue.name,
                numDepartments: formValue.numDepartments,
                postalCode: formValue.postalCode,
                town: formValue.town,
                requireConfigApiExt: formValue.requireConfigApiExt,
                configApiExtDmsType: formValue.configApiExtDmsType,
                code: formValue.code,
                enterpriseId: formValue.enterpriseId,
                storeId: formValue.storeId,
                configApiExtType: formValue.configApiExtType,
                configApiExtCsvHost: formValue.configApiExtCsvHost,
                configApiExtCsvPort: formValue.configApiExtCsvPort,
                configApiExtCsvDirectory: formValue.configApiExtCsvDirectory,
                configApiExtCsvPrefixFile: formValue.configApiExtCsvPrefixFile,
                configApiExtCsvUser: formValue.configApiExtCsvUser,
                configApiExtCsvPass: formValue.configApiExtCsvPass,
                configStockType: formValue.configStockType,
                configStockCsvHost: formValue.configStockCsvHost,
                configStockCsvPort: formValue.configStockCsvPort,
                configStockCsvDirectory: formValue.configStockCsvDirectory,
                configStockCsvPrefixFile: formValue.configStockCsvPrefixFile,
                configStockCsvUser: formValue.configStockCsvUser,
                configStockCsvPass: formValue.configStockCsvPass,
                workflowSubstate: formValue.workflowSubstate,
                requireConfigStockApiExt: formValue.requireConfigStockApiExt,
                configStockCode: formValue.configStockCode,
                configStockEnterpriseId: formValue.configStockEnterpriseId,
                configStockStoreId: formValue.configStockStoreId,
                configStockSubstates: formValue.requireConfigStockApiExt
                  ? this.checkAndFilterConfigStockSubstates(formValue.configStockSubstates)
                  : null,
                configMailerHost: formValue.configMailerHost,
                configMailerPort: formValue.configMailerPort,
                configMailerUserName: formValue.configMailerUserName,
                configMailerPass: formValue.configMailerPass,
                senderSms: formValue.senderSms,
                whatsappPhoneNumber: formValue.whatsappPhoneNumber,
                whatsappSender: formValue.whatsappSender,
                keyCommerce: formValue.keyCommerce,
                tpvCode: formValue.tpvCode,
                tpvTerminal: formValue.tpvTerminal
              },
              type
            )
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('organizations.facilities.responseSaveAndLoadCsvFile')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.customDialogService.close(CreateEditFacilityComponentModalEnum.ID);
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
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public selectAll(control: AbstractControl, list: any[]) {
    control.setValue(list);
  }

  public unselectAll(control: AbstractControl) {
    control.setValue([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public hasAllSelected(control: AbstractControl, list: any[]): boolean {
    const actualValue = control.value ? control.value : [];
    return haveArraysSameValues(
      actualValue.map((item: any) => (item?.id ? item.id : null)).sort(),
      list.map((item: any) => (item?.id ? item.id : null)).sort()
    );
  }

  private getListOptions(): void {
    this.brandsAsyncList = this.brandService.getAllBrands().pipe(
      tap({
        next: (brands: BrandDTO[]) => {
          this.brandsList = brands;
          const selectedBrands = this.facilityForm.get('brands').value;
          if (selectedBrands) {
            this.facilityForm.get('brands').setValue(
              brands.filter((brand: BrandDTO) => selectedBrands.find((brandSelec: BrandDTO) => brandSelec.id === brand.id)),
              { emitEvent: false }
            );
          }
        }
      })
    );
    this.countryAsyncList = this.localityService.getCountries().pipe(
      tap({
        next: (countries: CountryDTO[]) => {
          this.countryList = countries;
          const selectedCountry = this.facilityForm.get('country').value;
          if (selectedCountry) {
            this.facilityForm.get('country').setValue(
              countries.find((country: CountryDTO) => country.id === selectedCountry.id),
              { emitEvent: false }
            );
          }
        }
      })
    );
    this.getProvinceListOptions(true);
    this.getTownListOptions(true);
    this.substatesService
      .getAllStatesAndSubstates()
      .pipe(take(1))
      .subscribe((res) => {
        const substateList: WorkflowSubstateDTO[] = [];
        res.forEach((state: WorkflowStateDTO) => {
          state.workflowSubstates.forEach((substate: WorkflowSubstateDTO) => {
            if (substate.entryPoint) {
              substate.workflowState = { ...state, ...{ workflowSubstates: [] } };
              substateList.push(substate);
            }
          });
        });
        this.substateList = substateList;
        const selectedSubstate = this.facilityForm.get('workflowSubstate').value;
        const selectedSubstateNew = this.facilityForm.get('workflowSubstateNew').value;
        const selectedSubstateUsed = this.facilityForm.get('workflowSubstateUsed').value;
        if (selectedSubstate) {
          this.facilityForm.get('workflowSubstate').setValue(
            substateList.find((substate: WorkflowSubstateDTO) => substate.id === selectedSubstate.id),
            { emitEvent: false }
          );
        }
        if (selectedSubstateNew) {
          this.facilityForm.get('workflowSubstateNew').setValue(
            substateList.find((substate: WorkflowSubstateDTO) => substate.id === selectedSubstateNew.id),
            { emitEvent: false }
          );
        }
        if (selectedSubstateUsed) {
          this.facilityForm.get('workflowSubstateUsed').setValue(
            substateList.find((substate: WorkflowSubstateDTO) => substate.id === selectedSubstateUsed.id),
            { emitEvent: false }
          );
        }
        this.createTreeWorkflows(res);
      });
  }

  private checkAndFilterConfigStockSubstates(configStockSubstates: ConfigStockSubstate[] | null): ConfigStockSubstate[] | null {
    //Eliminamos los objetos cuya propiedad workflowSubstate sea nula
    const filteredSubstates = configStockSubstates.filter((substate) => substate.workflowSubstate !== null);
    //Si no quedan objetos devolvemos null
    if (filteredSubstates.length === 0) {
      return null;
    }

    return filteredSubstates;
  }

  private createTreeWorkflows(states: WorkflowStateDTO[]): void {
    const treeNode: TreeNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherWorkflows: any = {};
    const workflowsIdsFound: number[] = [];
    states.forEach((state: WorkflowStateDTO) => {
      if (workflowsIdsFound.indexOf(state.workflow.id) === -1) {
        const dataToPush = {
          name: `${this.translateService.instant('cards.workflows')}: ${state.workflow.name}`,
          children: [
            {
              name: `${this.translateService.instant('common.state')}: ${state.name}`,
              children: [...state.workflowSubstates.filter((substate: WorkflowSubstateDTO) => substate.entryPoint)]
            }
          ]
        };
        //Primero compruebo que tengamos subestados dentro del estado
        if (dataToPush.children?.length && dataToPush.children[0]?.children?.length) {
          //Es un workflow nuevo
          workflowsIdsFound.push(state.workflow.id);
          //Es otro workflow
          otherWorkflows[state.workflow.id] = dataToPush;
        }
      } else {
        const dataToPush = {
          name: `${this.translateService.instant('common.state')}: ${state.name}`,
          children: [...state.workflowSubstates.filter((substate: WorkflowSubstateDTO) => substate.entryPoint)]
        };
        //compruebo que tengamos subestados dentro del estado
        if (dataToPush.children.length) {
          otherWorkflows[state.workflow.id].children.push(dataToPush);
        }
      }
    });
    Object.keys(otherWorkflows).forEach((k) => {
      treeNode.push(otherWorkflows[k]);
    });
    this.treeData = treeNode;
  }
  private getProvinceListOptions(initialLoad = false): void {
    this.provinceList = [];
    if (this.form.country.value) {
      this.localityService
        .getProvincesByCountryId(this.form.country.value.id)
        .pipe(take(1))
        .subscribe((provinces: ProvinceDTO[]) => {
          this.provinceList = provinces;
          const selectedProvince = this.facilityForm.get('province').value;
          if (selectedProvince && initialLoad) {
            this.facilityForm.get('province').setValue(
              provinces.find((province: ProvinceDTO) => province.id === selectedProvince.id),
              { emitEvent: false }
            );
          }
        });
    }
  }
  private getTownListOptions(initialLoad = false): void {
    this.townList = [];
    if (this.form.province.value) {
      this.localityService
        .getTownsByProvinceId(this.form.province.value.id)
        .pipe(take(1))
        .subscribe((towns: TownDTO[]) => {
          this.townList = towns;
          const selectedTown = this.facilityForm.get('town').value;
          if (selectedTown && initialLoad) {
            this.facilityForm.get('town').setValue(
              towns.find((town: TownDTO) => town.id === selectedTown.id),
              { emitEvent: false }
            );
          }
        });
    }
  }

  private initializeConfigStockSubstates(
    configStockSubstates: ConfigStockSubstate[] | null,
    facilityId: number | null
  ): ConfigStockSubstate[] {
    const newSubstate: ConfigStockSubstate = { id: null, facilityId, inventoryType: 'NEW', workflowSubstate: null };
    const usedSubstate: ConfigStockSubstate = { id: null, facilityId, inventoryType: 'USED', workflowSubstate: null };

    if (!configStockSubstates) {
      return [newSubstate, usedSubstate];
    }

    const hasNew = configStockSubstates.some((substate) => substate.inventoryType === 'NEW');
    const hasUsed = configStockSubstates.some((substate) => substate.inventoryType === 'USED');

    const result = [...configStockSubstates];
    if (!hasNew) {
      result.push(newSubstate);
    }
    if (!hasUsed) {
      result.push(usedSubstate);
    }
    return result;
  }

  private updateConfigStockSubstates(inventoryType: 'NEW' | 'USED', workflowSubstate: WorkflowSubstateDTO): void {
    const configStockSubstates = this.facilityForm.get('configStockSubstates').value;
    //@ts-ignore
    const configWorkflow = configStockSubstates?.find((state) => state.inventoryType === inventoryType);
    if (configWorkflow) {
      configWorkflow.workflowSubstate = workflowSubstate;
      this.facilityForm.get('configStockSubstates').setValue(configStockSubstates);
    }
  }

  private initializeForm = (): void => {
    const initialConfigStockSubstates = this.initializeConfigStockSubstates(
      this.facilityToEdit?.configStockSubstates || null,
      this.facilityToEdit?.id || null
    );
    this.facilityForm = this.fb.group(
      {
        address: [this.facilityToEdit ? this.facilityToEdit.address : null],
        brands: [this.facilityToEdit ? this.facilityToEdit.brands : [], Validators.required],
        cif: [this.facilityToEdit ? this.facilityToEdit.cif : null],
        email: [this.facilityToEdit ? this.facilityToEdit.email : null, Validators.email],
        footer: [this.facilityToEdit ? this.facilityToEdit.footer : null],
        header: [this.facilityToEdit ? this.facilityToEdit.header : null],
        id: [this.facilityToEdit ? this.facilityToEdit.id : null],
        name: [
          this.facilityToEdit ? this.facilityToEdit.name : null,
          [Validators.required, Validators.minLength(this.minLength)]
        ],
        numDepartments: [this.facilityToEdit ? this.facilityToEdit.numDepartments : 0],
        postalCode: [this.facilityToEdit ? this.facilityToEdit.postalCode : null],
        town: [this.facilityToEdit?.town ? this.facilityToEdit.town : null],
        province: [this.facilityToEdit && this.facilityToEdit.town?.province ? this.facilityToEdit.town.province : null],
        country: [
          this.facilityToEdit && this.facilityToEdit.town?.province?.country ? this.facilityToEdit.town.province.country : null
        ],
        requireConfigApiExt: [
          this.facilityToEdit && this.facilityToEdit.requireConfigApiExt ? this.facilityToEdit.requireConfigApiExt : false
        ],
        // configApiExtDefault: Instalación por defecto autoline
        // configApiExtDefault: [
        //   this.facilityToEdit && this.facilityToEdit.configApiExtDefault ? this.facilityToEdit.configApiExtDefault : false
        // ],
        code: [this.facilityToEdit && this.facilityToEdit.code ? this.facilityToEdit.code : null],
        enterpriseId: [this.facilityToEdit && this.facilityToEdit.enterpriseId ? this.facilityToEdit.enterpriseId : null],
        storeId: [this.facilityToEdit && this.facilityToEdit.storeId ? this.facilityToEdit.storeId : null],
        workflowSubstate: [
          this.facilityToEdit && this.facilityToEdit.workflowSubstate ? this.facilityToEdit.workflowSubstate : null
        ],
        requireConfigStockApiExt: [
          this.facilityToEdit && this.facilityToEdit.requireConfigStockApiExt
            ? this.facilityToEdit.requireConfigStockApiExt
            : false
        ],
        configApiExtType: [
          this.facilityToEdit && this.facilityToEdit.configApiExtType ? this.facilityToEdit.configApiExtType : null
        ],
        configApiExtDmsType: [
          this.facilityToEdit && this.facilityToEdit.configApiExtDmsType ? this.facilityToEdit.configApiExtDmsType : null
        ],
        configApiExtCsvHost: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvHost ? this.facilityToEdit.configApiExtCsvHost : null
        ],
        configApiExtCsvPort: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvPort ? this.facilityToEdit.configApiExtCsvPort : null
        ],
        configApiExtCsvDirectory: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvDirectory
            ? this.facilityToEdit.configApiExtCsvDirectory
            : null
        ],
        configApiExtCsvPrefixFile: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvPrefixFile
            ? this.facilityToEdit.configApiExtCsvPrefixFile
            : null
        ],
        configApiExtCsvUser: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvUser ? this.facilityToEdit.configApiExtCsvUser : null
        ],
        configApiExtCsvPass: [
          this.facilityToEdit && this.facilityToEdit.configApiExtCsvPass ? this.facilityToEdit.configApiExtCsvPass : null
        ],
        configStockType: [
          this.facilityToEdit && this.facilityToEdit.configStockType ? this.facilityToEdit.configStockType : null
        ],
        configStockCsvHost: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvHost ? this.facilityToEdit.configStockCsvHost : null
        ],
        configStockCsvPort: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvPort ? this.facilityToEdit.configStockCsvPort : null
        ],
        configStockCsvDirectory: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvDirectory ? this.facilityToEdit.configStockCsvDirectory : null
        ],
        configStockCsvPrefixFile: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvPrefixFile
            ? this.facilityToEdit.configStockCsvPrefixFile
            : null
        ],
        configStockCsvUser: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvUser ? this.facilityToEdit.configStockCsvUser : null
        ],
        configStockCsvPass: [
          this.facilityToEdit && this.facilityToEdit.configStockCsvPass ? this.facilityToEdit.configStockCsvPass : null
        ],
        configStockCode: [
          this.facilityToEdit && this.facilityToEdit.configStockCode ? this.facilityToEdit.configStockCode : null
        ],
        configStockEnterpriseId: [
          this.facilityToEdit && this.facilityToEdit.configStockEnterpriseId ? this.facilityToEdit.configStockEnterpriseId : null
        ],
        configStockStoreId: [
          this.facilityToEdit && this.facilityToEdit.configStockStoreId ? this.facilityToEdit.configStockStoreId : null
        ],
        configStockSubstates: [initialConfigStockSubstates],
        workflowSubstateNew: [
          (this.facilityToEdit &&
            this.facilityToEdit.configStockSubstates &&
            this.facilityToEdit.configStockSubstates.find((state) => state.inventoryType === 'NEW')?.workflowSubstate) ||
            null
        ],
        workflowSubstateUsed: [
          (this.facilityToEdit &&
            this.facilityToEdit.configStockSubstates &&
            this.facilityToEdit.configStockSubstates.find((state) => state.inventoryType === 'USED')?.workflowSubstate) ||
            null
        ],
        configMailerHost: [
          this.facilityToEdit && this.facilityToEdit.configMailerHost ? this.facilityToEdit.configMailerHost : null
        ],
        configMailerPort: [
          this.facilityToEdit && this.facilityToEdit.configMailerPort ? this.facilityToEdit.configMailerPort : null
        ],
        configMailerUserName: [
          this.facilityToEdit && this.facilityToEdit.configMailerUserName ? this.facilityToEdit.configMailerUserName : null
        ],
        configMailerPass: [
          this.facilityToEdit && this.facilityToEdit.configMailerPass ? this.facilityToEdit.configMailerPass : null
        ],
        senderSms: [
          this.facilityToEdit && this.facilityToEdit.senderSms ? this.facilityToEdit.senderSms : null,
          [Validators.minLength(this.minLength), Validators.maxLength(this.maxLength)]
        ],
        whatsappPhoneNumber: [
          this.facilityToEdit && this.facilityToEdit.whatsappPhoneNumber ? this.facilityToEdit.whatsappPhoneNumber : null
        ],
        whatsappSender: [
          this.facilityToEdit && this.facilityToEdit.whatsappSender ? this.facilityToEdit.whatsappSender : null,
          [Validators.minLength(this.minLength), Validators.maxLength(this.maxLength)]
        ],
        keyCommerce: [this.facilityToEdit && this.facilityToEdit.keyCommerce ? this.facilityToEdit.keyCommerce : null],
        tpvCode: [this.facilityToEdit && this.facilityToEdit.tpvCode ? this.facilityToEdit.tpvCode : null],
        tpvTerminal: [this.facilityToEdit && this.facilityToEdit.tpvTerminal ? this.facilityToEdit.tpvTerminal : null],
        configApiTpvAttachmentsTab: [
          this.facilityToEdit && this.facilityToEdit.configApiTpvAttachmentsTab
            ? this.facilityToEdit.configApiTpvAttachmentsTab
            : null
        ],
        configApiTtpvAttachmentsCategory: [
          this.facilityToEdit && this.facilityToEdit.configApiTtpvAttachmentsCategory
            ? this.facilityToEdit.configApiTtpvAttachmentsCategory
            : null
        ]
      },
      {
        validators: [
          validateConfigMailers,
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('keyCommerce', [
            { control: 'tpvCode', operation: 'diff', value: null }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('keyCommerce', [
            { control: 'tpvTerminal', operation: 'diff', value: null }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('tpvCode', [
            { control: 'tpvTerminal', operation: 'diff', value: null }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('tpvCode', [
            { control: 'keyCommerce', operation: 'diff', value: null }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('tpvTerminal', [
            { control: 'tpvCode', operation: 'diff', value: null }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('tpvTerminal', [
            { control: 'keyCommerce', operation: 'diff', value: null }
          ])
        ]
      }
    );

    this.requiredConfigChange(this.facilityToEdit?.requireConfigApiExt);
    this.facilityForm.controls.country.valueChanges.pipe(untilDestroyed(this)).subscribe((x) => {
      this.form.province.setValue(null);
      this.getProvinceListOptions();
    });
    this.facilityForm.controls.province.valueChanges.pipe(untilDestroyed(this)).subscribe((x) => {
      this.form.town.setValue(null);
      this.getTownListOptions();
    });
  };
}

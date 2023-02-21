/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/organization/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import CountryDTO from '@data/models/location/country-dto';
import { LocalityService } from '@data/services/locality.service';
import ProvinceDTO from '@data/models/location/province-dto';
import TownDTO from '@data/models/location/town-dto';
import BrandDTO from '@data/models/organization/brand-dto';
import { BrandService } from '@data/services/brand.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { CommonModule } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';
import TreeNode from '@data/interfaces/tree-node';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';

export const enum CreateEditFacilityComponentModalEnum {
  ID = 'create-edit-facility-dialog-id',
  PANEL_CLASS = 'create-edit-facility-dialog',
  TITLE = 'organizations.facilities.create'
}

@Component({
  selector: 'app-create-edit-facility',
  templateUrl: './create-edit-facility.component.html',
  styleUrls: ['./create-edit-facility.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditFacilityComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  public labels = {
    title: marker('organizations.facilities.create'),
    name: marker('userProfile.name'),
    createFacility: marker('organizations.facilities.create'),
    editFacility: marker('organizations.facilities.edit'),
    address: marker('common.address'),
    integration: marker('organizations.facilities.integration'),
    requireConfigApiExt: marker('organizations.facilities.requireConfigApiExt'),
    code: marker('organizations.facilities.code'),
    enterpriseId: marker('organizations.facilities.enterpriseId'),
    storeId: marker('organizations.facilities.storeId'),
    workflowSubstate: marker('organizations.facilities.substateConfig'),
    postalCode: marker('common.postalCode'),
    brands: marker('common.brands'),
    cif: marker('common.cif'),
    email: marker('userProfile.email'),
    country: marker('common.country'),
    province: marker('common.province'),
    town: marker('common.town'),
    data: marker('userProfile.data'),
    emails: marker('common.emails'),
    header: marker('common.header'),
    nameRequired: marker('userProfile.nameRequired'),
    select: marker('common.select'),
    footer: marker('common.footer'),
    insertText: marker('common.insertTextHere'),
    required: marker('errors.required'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    emailError: marker('errors.emailPattern'),
    minLength: marker('errors.minLength')
  };
  public minLength = 3;
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
      this.facilityForm.get('code').setValidators([Validators.required]);
      this.facilityForm.get('enterpriseId').setValidators([Validators.required]);
      this.facilityForm.get('storeId').setValidators([Validators.required]);
    } else {
      this.facilityForm.get('code').setValidators([]);
      this.facilityForm.get('enterpriseId').setValidators([]);
      this.facilityForm.get('storeId').setValidators([]);
      this.facilityForm.get('code').setValue(null);
      this.facilityForm.get('enterpriseId').setValue(null);
      this.facilityForm.get('storeId').setValue(null);
      this.facilityForm.get('workflowSubstate').setValue(null);
    }
  }
  public removeSubstate(): void {
    this.facilityForm.get('workflowSubstate').setValue(null);
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
        code: formValue.code,
        enterpriseId: formValue.enterpriseId,
        storeId: formValue.storeId,
        workflowSubstate: formValue.workflowSubstate
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
        if (selectedSubstate) {
          this.facilityForm.get('workflowSubstate').setValue(
            substateList.find((substate: WorkflowSubstateDTO) => substate.id === selectedSubstate.id),
            { emitEvent: false }
          );
        }
        this.createTreeWorkflows(res);
      });
  }
  private createTreeWorkflows(states: WorkflowStateDTO[]): void {
    const treeNode: TreeNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherWorkflows: any = {};
    const workflowsIdsFound: number[] = [];
    states.forEach((state: WorkflowStateDTO) => {
      if (workflowsIdsFound.indexOf(state.workflow.id) === -1) {
        //Es un workflow nuevo
        workflowsIdsFound.push(state.workflow.id);
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
      this.localityService.getProvincesByCountryId(this.form.country.value.id).subscribe((provinces: ProvinceDTO[]) => {
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
      this.localityService.getTownsByProvinceId(this.form.province.value.id).subscribe((towns: TownDTO[]) => {
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
  private initializeForm = (): void => {
    this.facilityForm = this.fb.group({
      address: [this.facilityToEdit ? this.facilityToEdit.address : null],
      brands: [this.facilityToEdit ? this.facilityToEdit.brands : [], Validators.required],
      cif: [this.facilityToEdit ? this.facilityToEdit.cif : null],
      email: [this.facilityToEdit ? this.facilityToEdit.email : null, Validators.email],
      footer: [this.facilityToEdit ? this.facilityToEdit.footer : null],
      header: [this.facilityToEdit ? this.facilityToEdit.header : null],
      id: [this.facilityToEdit ? this.facilityToEdit.id : null],
      name: [this.facilityToEdit ? this.facilityToEdit.name : null, [Validators.required, Validators.minLength(this.minLength)]],
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
      code: [this.facilityToEdit && this.facilityToEdit.code ? this.facilityToEdit.code : null],
      enterpriseId: [this.facilityToEdit && this.facilityToEdit.enterpriseId ? this.facilityToEdit.enterpriseId : null],
      storeId: [this.facilityToEdit && this.facilityToEdit.storeId ? this.facilityToEdit.storeId : null],
      workflowSubstate: [
        this.facilityToEdit && this.facilityToEdit.workflowSubstate ? this.facilityToEdit.workflowSubstate : null
      ]
    });
    this.requiredConfigChange(this.facilityToEdit?.requireConfigApiExt);
    this.facilityForm.controls.country.valueChanges.subscribe((x) => {
      this.form.province.setValue(null);
      this.getProvinceListOptions();
    });
    this.facilityForm.controls.province.valueChanges.subscribe((x) => {
      this.form.town.setValue(null);
      this.getTownListOptions();
    });
  };
}

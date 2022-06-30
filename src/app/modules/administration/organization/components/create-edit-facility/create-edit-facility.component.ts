import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
import { TextEditorWrapperConfigI } from '@modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import BrandDTO from '@data/models/brand-dto';
import { BrandService } from '@data/services/brand.service';
import CountryDto from '@data/models/country-dto';
import { LocalityService } from '@data/services/locality.service';
import ProvinceDto from '@data/models/province-dto';
import TownDto from '@data/models/town-dto';

export const enum CreateEditFacilityComponentModalEnum {
  ID = 'create-edit-facility-dialog-id',
  PANEL_CLASS = 'create-edit-facility-dialog',
  TITLE = 'organizations.facilities.create'
}

@Component({
  selector: 'app-create-edit-facility',
  templateUrl: './create-edit-facility.component.html',
  styleUrls: ['./create-edit-facility.component.scss']
})
export class CreateEditFacilityComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('organizations.facilities.create'),
    name: marker('userProfile.name'),
    createFacility: marker('organizations.facilities.create'),
    editFacility: marker('organizations.facilities.edit'),
    brands: marker('common.brands'),
    address: marker('common.address'),
    postalCode: marker('common.postalCode'),
    cif: marker('common.cif'),
    email: marker('userProfile.email'),
    country: marker('common.country'),
    province: marker('common.province'),
    town: marker('common.town'),
    data: marker('userProfile.data'),
    emails: marker('common.emails'),
    header: marker('common.header'),
    nameRequired: marker('userProfile.nameRequired'),
    footer: marker('common.footer'),
    insertText: marker('common.insertTextHere'),
    required: marker('errors.required'),
    emailError: marker('errors.emailPattern'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll')
  };
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public countryAsyncList: Observable<CountryDto[]>;
  public countryList: CountryDto[] = [];
  public provinceList: ProvinceDto[] = [];
  public townList: TownDto[] = [];
  public facilityForm: FormGroup;
  public facilityToEdit: FacilityDTO = null;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true
    // addVariablesInsertionOption: false,
    // variablesOpt: ['una', 'dos']
  };

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private facilityService: FacilityService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private localityService: LocalityService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {
    super(
      CreateEditFacilityComponentModalEnum.ID,
      CreateEditFacilityComponentModalEnum.PANEL_CLASS,
      CreateEditFacilityComponentModalEnum.TITLE
    );
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

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.facilityForm.touched && this.facilityForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
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
        footer: formValue.footer,
        header: formValue.header,
        id: formValue.id,
        name: formValue.name,
        numDepartments: formValue.numDepartments,
        postalCode: formValue.postalCode,
        town: formValue.town
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

  // Convenience getter for easy access to form fields
  get form() {
    return this.facilityForm.controls;
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

  public textEditorContentChanged(type: 'header' | 'footer', html: string) {
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

  public selectAll(control: AbstractControl, list: BrandDTO[]) {
    control.setValue(list);
  }

  public unselectAll(control: AbstractControl) {
    control.setValue([]);
  }

  public hasAllSelected(control: AbstractControl, list: BrandDTO[]): boolean {
    const actualValue = control.value ? control.value : [];
    return haveArraysSameValues(
      actualValue.map((item: BrandDTO) => item.id).sort(),
      list.map((item: BrandDTO) => item.id).sort()
    );
  }

  private getListOptions(): void {
    this.brandsAsyncList = this.brandService.getAllBrands().pipe(
      tap({
        next: (brands: BrandDTO[]) => {
          this.brandsList = brands;
          this.facilityForm
            .get('brands')
            .setValue(
              this.facilityForm.get('brands').value.map((b: BrandDTO) => brands.find((brand: BrandDTO) => brand.id === b.id))
            );
        }
      })
    );
    this.countryAsyncList = this.localityService.getCountries().pipe(
      tap({
        next: (countries: CountryDto[]) => {
          this.countryList = countries;
          const selectedCountry = this.facilityForm.get('country').value;
          if (selectedCountry) {
            this.facilityForm.get('country').setValue(
              countries.find((country: CountryDto) => country.id === selectedCountry.id),
              { emitEvent: false }
            );
          }
        }
      })
    );
    if (this.form.country.value) {
      this.getProvinceListOptions(true);
    }
    if (this.form.province.value) {
      this.getTownListOptions(true);
    }
  }
  private getProvinceListOptions(initialLoad = false): void {
    this.provinceList = [];
    this.localityService.getProvincesByCountryId(this.form.country.value.id).subscribe((provinces: ProvinceDto[]) => {
      this.provinceList = provinces;
      const selectedProvince = this.facilityForm.get('province').value;
      if (selectedProvince && initialLoad) {
        this.facilityForm.get('province').setValue(
          provinces.find((province: ProvinceDto) => province.id === selectedProvince.id),
          { emitEvent: false }
        );
      }
    });
  }
  private getTownListOptions(initialLoad = false): void {
    this.townList = [];
    this.localityService.getTownsByProvinceId(this.form.province.value.id).subscribe((towns: TownDto[]) => {
      this.townList = towns;
      const selectedTown = this.facilityForm.get('town').value;
      if (selectedTown && initialLoad) {
        this.facilityForm.get('town').setValue(
          towns.find((town: TownDto) => town.id === selectedTown.id),
          { emitEvent: false }
        );
      }
    });
  }
  private initializeForm = (): void => {
    this.facilityForm = this.fb.group({
      address: [this.facilityToEdit ? this.facilityToEdit.address : null],
      brands: [this.facilityToEdit ? this.facilityToEdit.brands : [], Validators.required],
      cif: [this.facilityToEdit ? this.facilityToEdit.cif : null],
      email: [this.facilityToEdit ? this.facilityToEdit.email : null, Validators.email],
      footer: [this.facilityToEdit ? this.facilityToEdit.footer : ''],
      header: [this.facilityToEdit ? this.facilityToEdit.header : ''],
      id: [this.facilityToEdit ? this.facilityToEdit.id : null],
      name: [this.facilityToEdit ? this.facilityToEdit.name : '', Validators.required],
      numDepartments: [this.facilityToEdit ? this.facilityToEdit.numDepartments : 0],
      postalCode: [this.facilityToEdit ? this.facilityToEdit.postalCode : ''],
      town: [this.facilityToEdit ? this.facilityToEdit.town : ''],
      province: [this.facilityToEdit && this.facilityToEdit.town ? this.facilityToEdit.town.province : ''],
      country: [this.facilityToEdit && this.facilityToEdit.town ? this.facilityToEdit.town.province.country : '']
    });
    this.facilityForm.controls.country.valueChanges.subscribe((x) => {
      this.form.province.setValue('');
      this.getProvinceListOptions();
    });
    this.facilityForm.controls.province.valueChanges.subscribe((x) => {
      this.form.town.setValue('');
      this.getTownListOptions();
    });
  };
}

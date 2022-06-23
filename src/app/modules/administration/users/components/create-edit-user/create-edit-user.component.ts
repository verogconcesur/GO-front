/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
import { Observable, of } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { passwordPattern } from '@app/constants/patterns.constants';
import { UserService } from '@data/services/user.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { ConcenetError } from '@app/types/error';
import BrandDTO from '@data/models/brand-dto';
import { BrandService } from '@data/services/brand.service';
import FacilityDTO from '@data/models/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import DepartmentDTO from '@data/models/department-dto';
import { NGXLogger } from 'ngx-logger';
import { DepartmentService } from '@data/services/deparment.service';
import SpecialtyDTO from '@data/models/specialty-dto';
import { SpecialtyService } from '@data/services/specialty.service';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import RoleDTO from '@data/models/role-dto';
import { RoleService } from '@data/services/role.service';
import { UsersPermissionsComponent } from '../users-permissions/users-permissions.component';
import UserDetailsDTO from '@data/models/user-details-dto';
import { PermissionsService } from '@data/services/permissions.service';
import PermissionsDTO from '@data/models/permissions-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';

export const enum CreateEditUserComponentModalEnum {
  ID = 'create-edit-user-dialog-id',
  PANEL_CLASS = 'create-edit-user-dialog',
  TITLE = 'user.add'
}

@Component({
  selector: 'app-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  styleUrls: ['./create-edit-user.component.scss']
})
export class CreateEditUserComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  @ViewChild('permissionsListComponent') permissionsListComponent: UsersPermissionsComponent;
  public labels = {
    title: marker('user.add'),
    name: marker('userProfile.name'),
    firstName: marker('userProfile.firstName'),
    lastName: marker('userProfile.lastName2'),
    userName: marker('userProfile.userName'),
    email: marker('userProfile.email'),
    role: marker('userProfile.role'),
    nick: marker('userProfile.nick'),
    organization: marker('userProfile.organization'),
    edit: marker('userProfile.edit'),
    sign: marker('userProfile.sign'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    nameRequired: marker('userProfile.nameRequired'),
    firstNameRequired: marker('userProfile.firstNameRequired'),
    password: marker('login.password'),
    password1: marker('login.restorePassword.password1'),
    password2: marker('login.restorePassword.password2'),
    passwordRequired: marker('login.restorePassword.passwordRequired'),
    passwordPattern: marker('login.restorePassword.passwordPattern'),
    passwordMatch: marker('login.restorePassword.passwordMatch'),
    permissions: marker('users.permissions'),
    selectRoleFirst: marker('user.selectRoleFirst'),
    permissionsInheritFromRole: marker('user.permissionsInheritFromRole'),
    reset: marker('common.reset'),
    userPermissions: marker('user.userPermissions'),
    required: marker('errors.required'),
    emailError: marker('errors.emailPattern'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll')
  };
  public userPermissions: { permission: PermissionsDTO; checked: boolean }[] = [];
  public userForm: FormGroup;
  public rolesAsyncList: Observable<RoleDTO[]>;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public facilitiesList: FacilitiesGroupedByBrand[] = [];
  public departmentsList: DepartmentsGroupedByFacility[] = [];
  public specialtiesList: SpecialtiesGroupedByDepartment[] = [];
  public userToEdit: UserDetailsDTO = null;

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private userService: UserService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private roleService: RoleService,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private permissionsService: PermissionsService,
    private specialtyService: SpecialtyService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditUserComponentModalEnum.ID,
      CreateEditUserComponentModalEnum.PANEL_CLASS,
      CreateEditUserComponentModalEnum.TITLE
    );
  }

  ngOnInit() {
    this.userToEdit = this.extendedComponentData;
    if (this.userToEdit) {
      this.MODAL_TITLE = marker('user.edit');
    }
    this.getUsersPermissions();
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {
    this.facilitySevice.resetFacilitiesData();
    this.departmentService.resetDepartmentsData();
    this.specialtyService.resetSpecialtiesData();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.userForm.touched && this.userForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | UserDetailsDTO> {
    const formValue = this.userForm.value;
    //Role permissions + User permissions
    formValue.permissions = [
      ...this.permissionsListComponent.getPermissionsChecked(),
      ...this.userPermissions.filter((pObj) => pObj.checked).map((pObj) => pObj.permission)
    ];
    formValue.password = formValue.newPassword;
    if (this.userToEdit) {
      formValue.id = this.userToEdit.id;
    }
    const spinner = this.spinnerService.show();
    return this.userService.addUser(formValue).pipe(
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
          label: marker('user.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteUser,
          hiddenFn: () => !this.userToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () =>
            !(((this.userForm.touched && this.userForm.dirty) || this.changesInPermissions()) && this.userForm.valid)
        }
      ]
    };
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.userForm.controls;
  }

  public selectAll(type: 'specialties' | 'departments' | 'facilities' | 'brands', control: AbstractControl, list: any[]) {
    if (type === 'brands') {
      control.setValue(list);
    } else {
      control.setValue(list.reduce((prev, act) => [...prev, ...act[type]], []));
    }
    this.getOptionsAfterSelection(type);
  }

  public unselectAll(type: 'specialties' | 'departments' | 'facilities' | 'brands', control: AbstractControl) {
    control.setValue([]);
    this.getOptionsAfterSelection(type);
  }

  public hasAllSelected(
    type: 'specialties' | 'departments' | 'facilities' | 'brands',
    control: AbstractControl,
    list: any[]
  ): boolean {
    if (type !== 'brands') {
      list = list.reduce((prev, act) => [...prev, ...act[type]], []);
    }
    const actualValue = control.value ? control.value : [];
    return haveArraysSameValues(actualValue.map((item: any) => item.id).sort(), list.map((item: any) => item.id).sort());
  }

  public getOptionsAfterSelection(type: 'specialties' | 'departments' | 'facilities' | 'brands') {
    switch (type) {
      case 'brands':
        this.getFacilitiesOptions();
        break;
      case 'facilities':
        this.getDepartmentsOptions();
        break;
      case 'departments':
        this.getSpecialtiesOptions();
        break;
    }
  }

  public getFacilitiesOptions(initialLoad = false): void {
    this.facilitySevice
      .getFacilitiesOptionsListByBrands(this.userForm.get('brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          if (this.userToEdit && initialLoad) {
            this.userForm.get('facilities').setValue(
              this.userForm.get('facilities').value.map((f: FacilityDTO) => {
                let facToReturn = f;
                response.forEach((group: FacilitiesGroupedByBrand) => {
                  const found = group.facilities.find((fac: FacilityDTO) => fac.id === f.id);
                  facToReturn = found ? found : facToReturn;
                });
                return facToReturn;
              })
            );
          }
          let selected = this.userForm.get('facilities').value ? this.userForm.get('facilities').value : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.userForm.get('facilities').setValue(selected);
          this.getDepartmentsOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(initialLoad = false): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.userForm.get('facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          if (this.userToEdit && initialLoad) {
            this.userForm.get('departments').setValue(
              this.userForm.get('departments').value.map((item: DepartmentDTO) => {
                let itemToReturn = item;
                response.forEach((group: DepartmentsGroupedByFacility) => {
                  const found = group.departments.find((i: DepartmentDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.userForm.get('departments').value ? this.userForm.get('departments').value : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.userForm.get('departments').setValue(selected);
          this.getSpecialtiesOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(initialLoad = false): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.userForm.get('departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          if (this.userToEdit && initialLoad) {
            this.userForm.get('specialties').setValue(
              this.userForm.get('specialties').value.map((item: SpecialtyDTO) => {
                let itemToReturn = item;
                response.forEach((group: SpecialtiesGroupedByDepartment) => {
                  const found = group.specialties.find((i: SpecialtyDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.userForm.get('specialties').value ? this.userForm.get('specialties').value : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );
          this.userForm.get('specialties').setValue(selected);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public checkPermission = (permissionObj: { permission: PermissionsDTO; checked: boolean }, event: MatCheckboxChange): void => {
    permissionObj.checked = event.checked;
  };

  public getPermissionsSelectedByDefault = (): PermissionsDTO[] | null =>
    this.userToEdit?.permissions ? this.userToEdit.permissions : null;

  private getListOptions(): void {
    this.rolesAsyncList = this.roleService.getAllRoles().pipe(
      tap({
        next: (roles: RoleDTO[]) => {
          if (this.userToEdit) {
            this.userForm.get('role').setValue(roles.find((role: RoleDTO) => role.id === this.userToEdit.role.id));
          }
        }
      })
    );
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
    this.brandsAsyncList = this.brandService.getAllBrands().pipe(
      tap({
        next: (brands: BrandDTO[]) => {
          this.brandsList = brands;
          if (this.userToEdit) {
            this.userForm
              .get('brands')
              .setValue(
                this.userForm.get('brands').value.map((b: BrandDTO) => brands.find((brand: BrandDTO) => brand.id === b.id))
              );
            this.getFacilitiesOptions(true);
          }
        }
      })
    );
  }

  private deleteUser = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('user.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          this.userService
            .deleteUser(this.userToEdit)
            .pipe(take(1))
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

  private initializeForm(): void {
    this.userForm = this.fb.group(
      {
        name: [this.userToEdit ? this.userToEdit.name : null, Validators.required],
        firstName: [this.userToEdit ? this.userToEdit.firstName : null],
        lastName: [this.userToEdit ? this.userToEdit.lastName : null],
        email: [this.userToEdit ? this.userToEdit.email : null, [Validators.email]],
        userName: [this.userToEdit ? this.userToEdit.userName : null, Validators.required],
        role: [this.userToEdit ? this.userToEdit.role : null, Validators.required],
        newPassword: [
          this.userToEdit ? this.userToEdit.password : null,
          [Validators.required, Validators.pattern(passwordPattern)]
        ],
        newPasswordConfirmation: [this.userToEdit ? this.userToEdit.password : null, Validators.required],
        brands: [this.userToEdit ? this.userToEdit.brands : null, Validators.required],
        facilities: [this.userToEdit ? this.userToEdit.facilities : null, Validators.required],
        departments: [this.userToEdit ? this.userToEdit.departments : null, Validators.required],
        specialties: [this.userToEdit ? this.userToEdit.specialties : null]
      },
      {
        validators: ConfirmPasswordValidator.mustMatch('newPassword', 'newPasswordConfirmation')
      }
    );
  }

  private getUsersPermissions(): void {
    this.permissionsService
      .getAllPermissions()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.userPermissions = response
            .filter((r) => r.type === this.permissionsService.PERMISSIONS_CODES_FOR_USERS)
            .map((p: PermissionsDTO) => ({
              permission: p,
              checked:
                this.userToEdit?.permissions && this.userToEdit.permissions.find((up: PermissionsDTO) => up.id === p.id)
                  ? true
                  : false
            }));
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  private changesInPermissions(): boolean {
    return haveArraysSameValues(
      this.userToEdit ? this.userToEdit.permissions.map((p) => p.id).sort() : [],
      [
        ...this.permissionsListComponent.getPermissionsChecked().map((p) => p.id),
        ...this.userPermissions
          .filter((pObj) => pObj.checked)
          .map((pObj) => pObj.permission)
          .map((p) => p.id)
      ].sort()
    );
  }
}

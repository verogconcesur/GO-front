import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { Observable, of } from 'rxjs';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import ConfirmPasswordValidator from '@shared/validators/confirm-password.validator';
import { passwordPattern } from '@app/constants/patterns.constants';
import { UserService } from '@data/services/user.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { catchError, finalize, map, take } from 'rxjs/operators';
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
import DespartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import RoleDTO from '@data/models/role-dto';
import { RoleService } from '@data/services/role.service';
import { UsersPermissionsComponent } from '../users-permissions/users-permissions.component';
import UserDetailsDTO from '@data/models/user-details-dto';
import { PermissionsService } from '@data/services/permissions.service';
import PermissionsDTO from '@data/models/permissions-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
    userPermissions: marker('user.userPermissions')
  };
  public userPermissions: { permission: PermissionsDTO; checked: boolean }[] = [];
  public userForm: FormGroup;
  public rolesAsyncList: Observable<RoleDTO[]>;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public facilitiesList: FacilitiesGroupedByBrand[];
  public departmentsList: DespartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];

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
    private specialtyService: SpecialtyService
  ) {
    super(
      CreateEditUserComponentModalEnum.ID,
      CreateEditUserComponentModalEnum.PANEL_CLASS,
      marker(CreateEditUserComponentModalEnum.TITLE)
    );
  }

  ngOnInit() {
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
    const spinner = this.spinnerService.show();
    return this.userService.addUser(formValue).pipe(
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: 'Close'
        });
        return response;
      }),
      catchError((error) => {
        const err = error.error as ConcenetError;
        this.globalMessageService.showError({
          message: err.message,
          actionText: 'Close'
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
          disabledFn: () => !(this.userForm.touched && this.userForm.dirty && this.userForm.valid)
        }
      ]
    };
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.userForm.controls;
  }

  public getFacilitiesOptions(): void {
    this.facilitySevice
      .getFacilitiesOptionsListByBrands(this.userForm.get('brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          let selected = this.userForm.get('facilities').value ? this.userForm.get('facilities').value : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.userForm.get('facilities').setValue(selected);
          this.getDepartmentsOptions();
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.userForm.get('facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          let selected = this.userForm.get('departments').value ? this.userForm.get('departments').value : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DespartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.userForm.get('departments').setValue(selected);
          this.getSpecialtiesOptions();
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.userForm.get('departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
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

  private getListOptions(): void {
    this.rolesAsyncList = this.roleService.getAllRoles();
    this.brandsAsyncList = this.brandService.getAllBrands();
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
  }

  private initializeForm(): void {
    this.userForm = this.fb.group(
      {
        name: [null, Validators.required],
        firstName: [null],
        lastName: [null],
        email: [null, Validators.required],
        userName: [null, Validators.required],
        role: [null, Validators.required],
        newPassword: [null, [Validators.required, Validators.pattern(passwordPattern)]],
        newPasswordConfirmation: [null, Validators.required],
        brands: [null],
        facilities: [null],
        departments: [null],
        specialties: [null]
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
            .map((p: PermissionsDTO) => ({ permission: p, checked: false }));
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: 'Close'
          });
        }
      });
  }
}

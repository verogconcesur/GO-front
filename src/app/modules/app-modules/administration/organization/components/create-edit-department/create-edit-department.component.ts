import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentDTO from '@data/models/organization/department-dto';
import { DepartmentService } from '@data/services/deparment.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, finalize, take } from 'rxjs/operators';

export const enum CreateEditDepartmentComponentModalEnum {
  ID = 'create-edit-department-dialog-id',
  PANEL_CLASS = 'create-edit-department-dialog',
  TITLE = 'organizations.departments.create'
}

@Component({
  selector: 'app-create-edit-department',
  templateUrl: './create-edit-department.component.html',
  styleUrls: ['./create-edit-department.component.scss']
})
export class CreateEditDepartmentComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('organizations.departments.create'),
    name: marker('userProfile.department'),
    createBrand: marker('organizations.departments.create'),
    editBrand: marker('organizations.departments.edit'),
    data: marker('userProfile.data'),
    emails: marker('common.emails'),
    email: marker('userProfile.email'),
    errorEmailPattern: marker('errors.emailPattern'),
    header: marker('common.header'),
    footer: marker('common.footer'),
    insertText: marker('common.insertTextHere'),
    nameRequired: marker('userProfile.nameRequired'),
    logo: marker('common.logo'),
    selectFile: marker('common.selectImageFile'),
    select: marker('common.select'),
    minLength: marker('errors.minLength')
  };
  public minLength = 3;
  public departmentForm: UntypedFormGroup;
  public departmentToEdit: DepartmentDTO = null;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true
    // addMacroListOption: false,
    // macroListOptions: ['una', 'dos']
  };
  private facilityId: number;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private departmentService: DepartmentService
  ) {
    super(
      CreateEditDepartmentComponentModalEnum.ID,
      CreateEditDepartmentComponentModalEnum.PANEL_CLASS,
      CreateEditDepartmentComponentModalEnum.TITLE
    );
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.departmentForm.controls;
  }

  ngOnInit(): void {
    this.departmentToEdit = this.extendedComponentData?.department;
    if (this.departmentToEdit) {
      this.MODAL_TITLE = this.labels.editBrand;
      this.facilityId = this.departmentToEdit.facility?.id
        ? this.departmentToEdit.facility.id
        : this.extendedComponentData?.facilityId;
    } else {
      this.facilityId = this.extendedComponentData?.facilityId;
    }
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.departmentForm.touched && this.departmentForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | DepartmentDTO> {
    const formValue = this.departmentForm.value;
    const spinner = this.spinnerService.show();
    return this.departmentService
      .addDepartment({
        footer: formValue.footer ? formValue.footer : null,
        header: formValue.header ? formValue.header : null,
        id: formValue.id,
        facility: {
          id: this.facilityId
        },
        name: formValue.name,
        email: formValue.email,
        numSpecialties: formValue.numSpecialties
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
          label: marker('organizations.departments.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteBrand,
          hiddenFn: () => !this.departmentToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.departmentForm.touched && this.departmentForm.dirty && this.departmentForm.valid)
        }
      ]
    };
  }

  public deleteBrand = (): void => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.departments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.departmentService
            .deleteDepartment(this.departmentToEdit.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: (response) => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error: ConcenetError) => {
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
      this.departmentForm.get('header').setValue(html, { emitEvent: true });
      this.departmentForm.get('header').markAsDirty();
      this.departmentForm.get('header').markAsTouched();
    } else if (type === 'footer' && html !== this.form.footer.value) {
      this.departmentForm.get('footer').setValue(html, { emitEvent: true });
      this.departmentForm.get('footer').markAsDirty();
      this.departmentForm.get('footer').markAsTouched();
    }
  }

  private initializeForm = (): void => {
    this.departmentForm = this.fb.group({
      id: [this.departmentToEdit ? this.departmentToEdit.id : null],
      numSpecialties: [this.departmentToEdit ? this.departmentToEdit.numSpecialties : 0],
      name: [
        this.departmentToEdit ? this.departmentToEdit.name : '',
        [Validators.required, Validators.minLength(this.minLength)]
      ],
      email: [this.departmentToEdit ? this.departmentToEdit.email : null, Validators.email],
      header: [this.departmentToEdit ? this.departmentToEdit.header : null],
      footer: [this.departmentToEdit ? this.departmentToEdit.footer : null]
    });
  };
}

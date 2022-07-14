import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentDTO from '@data/models/specialty-dto';
import { SpecialtyService } from '@data/services/specialty.service';
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

export const enum CreateEditSpecialtyComponentModalEnum {
  ID = 'create-edit-specialty-dialog-id',
  PANEL_CLASS = 'create-edit-specialty-dialog',
  TITLE = 'organizations.specialty.create'
}
@Component({
  selector: 'app-create-edit-specialty',
  templateUrl: './create-edit-specialty.component.html',
  styleUrls: ['./create-edit-specialty.component.scss']
})
export class CreateEditSpecialtyComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('organizations.specialties.create'),
    name: marker('userProfile.specialty'),
    createBrand: marker('organizations.specialties.create'),
    editBrand: marker('organizations.specialties.edit'),
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
    select: marker('common.select')
  };
  public specialtyForm: FormGroup;
  public specialtyToEdit: DepartmentDTO = null;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true
  };
  private departmentId: number;

  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private specialtyService: SpecialtyService
  ) {
    super(
      CreateEditSpecialtyComponentModalEnum.ID,
      CreateEditSpecialtyComponentModalEnum.PANEL_CLASS,
      CreateEditSpecialtyComponentModalEnum.TITLE
    );
  }
  ngOnInit(): void {
    this.specialtyToEdit = this.extendedComponentData?.specialty;
    if (this.specialtyToEdit) {
      this.MODAL_TITLE = this.labels.editBrand;
      this.departmentId = this.specialtyToEdit.department.id;
    } else {
      this.departmentId = this.extendedComponentData?.department;
    }
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.specialtyForm.touched && this.specialtyForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | DepartmentDTO> {
    const formValue = this.specialtyForm.value;
    const spinner = this.spinnerService.show();
    return this.specialtyService
      .addSpecialty({
        footer: formValue.footer ? formValue.footer : null,
        header: formValue.header ? formValue.header : null,
        id: formValue.id,
        department: {
          id: this.departmentId
        },
        name: formValue.name,
        email: formValue.email
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
          label: marker('organizations.specialties.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteSpecialty,
          hiddenFn: () => !this.specialtyToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.specialtyForm.touched && this.specialtyForm.dirty && this.specialtyForm.valid)
        }
      ]
    };
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.specialtyForm.controls;
  }

  public deleteSpecialty = (): void => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.specialties.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.specialtyService
            .deleteSpecialty(this.specialtyToEdit.id)
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

  public textEditorContentChanged(type: 'header' | 'footer', html: string) {
    if (type === 'header' && html !== this.form.header.value) {
      this.specialtyForm.get('header').setValue(html, { emitEvent: true });
      this.specialtyForm.get('header').markAsDirty();
      this.specialtyForm.get('header').markAsTouched();
    } else if (type === 'footer' && html !== this.form.footer.value) {
      this.specialtyForm.get('footer').setValue(html, { emitEvent: true });
      this.specialtyForm.get('footer').markAsDirty();
      this.specialtyForm.get('footer').markAsTouched();
    }
  }

  private initializeForm = (): void => {
    this.specialtyForm = this.fb.group({
      id: [this.specialtyToEdit ? this.specialtyToEdit.id : null],
      name: [this.specialtyToEdit ? this.specialtyToEdit.name : '', Validators.required],
      email: [this.specialtyToEdit ? this.specialtyToEdit.email : null, Validators.email],
      header: [this.specialtyToEdit ? this.specialtyToEdit.header : null],
      footer: [this.specialtyToEdit ? this.specialtyToEdit.footer : null]
    });
  };
}

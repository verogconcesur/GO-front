/* eslint-disable max-len */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import BrandDTO from '@data/models/organization/brand-dto';
import { BrandService } from '@data/services/brand.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@frontend/custom-dialog';
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
// eslint-disable-next-line max-len
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum CreateEditBrandComponentModalEnum {
  ID = 'create-edit-brand-dialog-id',
  PANEL_CLASS = 'create-edit-brand-dialog',
  TITLE = 'organizations.brands.create'
}

@Component({
  selector: 'app-create-edit-brand',
  templateUrl: './create-edit-brand.component.html',
  styleUrls: ['./create-edit-brand.component.scss']
})
export class CreateEditBrandComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  @ViewChild('UploadFileInput') uploadFileInput: ElementRef;
  public labels = {
    title: marker('organizations.brands.create'),
    name: marker('organizations.brands.name'),
    createBrand: marker('organizations.brands.create'),
    editBrand: marker('organizations.brands.edit'),
    data: marker('userProfile.data'),
    emails: marker('common.emails'),
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
  public brandForm: UntypedFormGroup;
  public brandToEdit: BrandDTO = null;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true
    // addMacroListOption: true,
    // macroListOptions: ['Nombre cliente', 'Nombre empresa']
  };

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private brandService: BrandService
  ) {
    super(
      CreateEditBrandComponentModalEnum.ID,
      CreateEditBrandComponentModalEnum.PANEL_CLASS,
      CreateEditBrandComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.brandForm.controls;
  }

  ngOnInit(): void {
    this.brandToEdit = this.extendedComponentData;
    if (this.brandToEdit) {
      this.MODAL_TITLE = this.labels.editBrand;
    }
    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.brandForm.touched && this.brandForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | BrandDTO> {
    const formValue = this.brandForm.value;
    const spinner = this.spinnerService.show();
    return this.brandService
      .addBrand({
        footer: formValue.footer ? formValue.footer : null,
        header: formValue.header ? formValue.header : null,
        id: formValue.id,
        logo: formValue.logoB64 ? formValue.logoB64.split(';base64,')[1] : null,
        logoContentType: formValue.logoB64 ? formValue.logoB64.split(';base64,')[0].split('data:')[1] : null,
        name: formValue.name,
        numFacilities: formValue.numFacilities
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
          label: marker('organizations.brands.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteBrand,
          hiddenFn: () => !this.brandToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.brandForm.touched && this.brandForm.dirty && this.brandForm.valid)
        }
      ]
    };
  }

  public deleteBrand = (): void => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('organizations.brands.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.brandService
            .deleteBrand(this.brandToEdit.id)
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
      this.brandForm.get('header').setValue(html, { emitEvent: true });
      this.brandForm.get('header').markAsDirty();
      this.brandForm.get('header').markAsTouched();
    } else if (type === 'footer' && html !== this.form.footer.value) {
      this.brandForm.get('footer').setValue(html, { emitEvent: true });
      this.brandForm.get('footer').markAsDirty();
      this.brandForm.get('footer').markAsTouched();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public fileChangeEvent(fileInput: any) {
    if (fileInput?.target?.files && fileInput.target.files[0]) {
      let myfilename = '';
      let logoImg: File;
      Array.from(fileInput.target.files).forEach((file: File) => {
        logoImg = file;
        myfilename += file.name;
      });
      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = (rs) => {
          // Return Base64 Data URL
          const imgBase64Path = e.target.result;
          this.brandForm.get('logoB64').setValue(imgBase64Path, { emitEvent: true });
          this.brandForm.get('myfilename').setValue(myfilename, { emitEvent: true });
          this.brandForm.get('logoB64').markAsDirty();
          this.brandForm.get('logoB64').markAsTouched();
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
      // Reset File Input to Selct Same file again
      this.uploadFileInput.nativeElement.value = '';
    } else {
      this.brandForm.get('logoB64').setValue('', { emitEvent: true });
    }
  }

  private initializeForm = (): void => {
    this.brandForm = this.fb.group({
      id: [this.brandToEdit ? this.brandToEdit.id : null],
      numFacilities: [this.brandToEdit ? this.brandToEdit.numFacilities : null],
      name: [this.brandToEdit ? this.brandToEdit.name : '', [Validators.required, Validators.minLength(this.minLength)]],
      header: [this.brandToEdit ? this.brandToEdit.header : null],
      footer: [this.brandToEdit ? this.brandToEdit.footer : null],
      logoB64: [
        this.brandToEdit && this.brandToEdit.logoContentType && this.brandToEdit.logo
          ? `data:${this.brandToEdit.logoContentType};base64,${this.brandToEdit.logo}`
          : ''
      ],
      myfilename: [
        this.brandToEdit?.logo ? `${this.brandToEdit.name}_logo` : this.translateService.instant(this.labels.selectFile)
      ]
    });
  };
}

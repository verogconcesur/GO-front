import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LandingConfigDTO from '@data/models/landing/landing-config-dto';
import LandingThemeDTO from '@data/models/landing/landing-theme-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { LandingService } from '@data/services/landing.service';
import { MediaViewerService } from '@modules/feature-modules/media-viewer-dialog/media-viewer.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-landing-config',
  templateUrl: './landing-config.component.html',
  styleUrls: ['./landing-config.component.scss']
})
export class LandingConfigComponent implements OnInit {
  @ViewChild('logoFileInput') logoFileInput: ElementRef;
  @ViewChild('logoAltFileInput') logoAltFileInput: ElementRef;
  @ViewChild('bgImageFileInput') bgImageFileInput: ElementRef;
  public landingConfig: LandingConfigDTO = null;
  public landingForm: UntypedFormGroup = null;
  public facilities: FacilityDTO[] = [];
  public themes: LandingThemeDTO[] = [];
  public labels = {
    fieldRequired: marker('common.fieldRequired'),
    logo: marker('landing.logo'),
    logoAlt: marker('landing.logoAlt'),
    bgImage: marker('landing.bgImage'),
    facilitiesConfig: marker('landing.facilitiesConfig'),
    facilities: marker('landing.facilities'),
    select: marker('common.select'),
    imagesConfig: marker('landing.imagesConfig'),
    view: marker('common.view'),
    themeConfig: marker('landing.themeConfig'),
    theme: marker('landing.theme'),
    save: marker('common.save')
  };
  constructor(
    private fb: FormBuilder,
    private landingService: LandingService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private mediaViewerService: MediaViewerService
  ) {}

  ngOnInit(): void {
    this.getLandingConfig();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public fileChangeEvent(fileInput: any, input: 'logo' | 'logoAlt' | 'backgroundImage') {
    if (fileInput?.target?.files && fileInput.target.files[0]) {
      const file = fileInput.target.files[0];
      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = (rs) => {
          // Return Base64 Data URL
          const imgBase64Path = e.target.result;
          this.landingForm.get(input).get('content').setValue(imgBase64Path.split(';base64,')[1], { emitEvent: true });
          this.landingForm.get(input).get('size').setValue(file.size, { emitEvent: true });
          this.landingForm
            .get(input)
            .get('type')
            .setValue(imgBase64Path.split(';base64')[0].split('data:')[1], { emitEvent: true });
          this.landingForm.get(input).get('name').setValue(file.name, { emitEvent: true });
          this.landingForm.get(input).get('thumbnail').setValue(null, { emitEvent: true });
          this.landingForm.get(input).markAsDirty();
          this.landingForm.get(input).markAsTouched();
        };
      };
      reader.readAsDataURL(file);
      // Reset File Input to Selct Same file again
      switch (input) {
        case 'logo':
          this.logoFileInput.nativeElement.value = '';
          break;
        case 'logoAlt':
          this.logoAltFileInput.nativeElement.value = '';
          break;
        case 'backgroundImage':
          this.bgImageFileInput.nativeElement.value = '';
          break;
      }
    } else {
      this.landingForm.get(input).get('content').setValue(null, { emitEvent: true });
      this.landingForm.get(input).get('size').setValue(null, { emitEvent: true });
      this.landingForm.get(input).get('logoB64').setValue(null, { emitEvent: true });
      this.landingForm.get(input).get('myfilename').setValue(null, { emitEvent: true });
    }
  }

  public previewImage(input: 'logo' | 'logoAlt' | 'backgroundImage') {
    if (this.landingForm.get(input).value) {
      this.mediaViewerService.openMediaViewer(this.landingForm.get(input).value);
    }
  }

  public submit(): void {
    const landingConfig = this.landingForm.value;
    landingConfig.landingTheme = landingConfig.landingTheme?.id ? landingConfig.landingTheme : null;
    landingConfig.facilities = this.facilities.map((f) => {
      if (landingConfig.facilities.find((f2: FacilityDTO) => f2.id === f.id)) {
        f.showInLanding = true;
      } else {
        f.showInLanding = false;
      }
      return f;
    });
    const spinner = this.spinnerService.show();
    this.landingService
      .saveLandingCofnig(landingConfig)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: LandingConfigDTO) => {
          this.landingConfig = data ? data : null;
          this.facilities = data?.facilities ? data.facilities : [];
          this.themes = data?.themes ? data.themes : [];
          this.themes = [
            {
              classTheme: null,
              id: null,
              name: this.translateService.instant(marker('landing.defaultTheme'))
            },
            ...this.themes
          ];
          this.initForm();
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        },
        error: (err) => {
          this.globalMessageService.showError({
            message: err?.message ? err.message : this.translateService.instant(marker('errors.unknown')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  private getLandingConfig(): void {
    const spinner = this.spinnerService.show();
    this.landingService
      .getLandingConfig()
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: LandingConfigDTO) => {
          this.landingConfig = data ? data : null;
          this.facilities = data?.facilities ? data.facilities : [];
          this.themes = data?.themes ? data.themes : [];
          this.themes = [
            {
              classTheme: null,
              id: null,
              name: this.translateService.instant(marker('landing.defaultTheme'))
            },
            ...this.themes
          ];
          this.initForm();
        },
        error: (err) => {
          this.globalMessageService.showError({
            message: err?.message ? err.message : this.translateService.instant(marker('errors.unknown')),
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  private initForm(): void {
    this.landingForm = this.fb.group({
      id: [this.landingConfig?.id ? this.landingConfig.id : null],
      facilities: [this.facilities.filter((facility) => facility.showInLanding)],
      backgroundImage: this.fb.group({
        content: [
          this.landingConfig?.backgroundImage?.content ? this.landingConfig.backgroundImage.content : null,
          Validators.required
        ],
        name: [this.landingConfig?.backgroundImage?.name ? this.landingConfig.backgroundImage.name : null, Validators.required],
        size: [this.landingConfig?.backgroundImage?.size ? this.landingConfig.backgroundImage.size : null, Validators.required],
        thumbnail: [
          this.landingConfig?.backgroundImage?.thumbnail ? this.landingConfig.backgroundImage.thumbnail : null,
          Validators.required
        ],
        type: [this.landingConfig?.backgroundImage?.type ? this.landingConfig.backgroundImage.type : null, Validators.required]
      }),
      landingTheme: [
        this.landingConfig?.landingTheme
          ? this.themes.find((t: LandingThemeDTO) => t.id === this.landingConfig.landingTheme.id)
          : this.themes.find((t: LandingThemeDTO) => !t.id),
        Validators.required
      ],
      logo: this.fb.group({
        content: [this.landingConfig?.logo?.content ? this.landingConfig.logo.content : null, Validators.required],
        name: [this.landingConfig?.logo?.name ? this.landingConfig.logo.name : null, Validators.required],
        size: [this.landingConfig?.logo?.size ? this.landingConfig.logo.size : null, Validators.required],
        thumbnail: [this.landingConfig?.logo?.thumbnail ? this.landingConfig.logo.thumbnail : null, Validators.required],
        type: [this.landingConfig?.logo?.type ? this.landingConfig.logo.type : null, Validators.required]
      }),
      logoAlt: this.fb.group({
        content: [this.landingConfig?.logoAlt?.content ? this.landingConfig.logoAlt.content : null, Validators.required],
        name: [this.landingConfig?.logoAlt?.name ? this.landingConfig.logoAlt.name : null, Validators.required],
        size: [this.landingConfig?.logoAlt?.size ? this.landingConfig.logoAlt.size : null, Validators.required],
        thumbnail: [this.landingConfig?.logoAlt?.thumbnail ? this.landingConfig.logoAlt.thumbnail : null, Validators.required],
        type: [this.landingConfig?.logoAlt?.type ? this.landingConfig.logoAlt.type : null, Validators.required]
      })
      // banners: [[...this.landingConfig.banners]],
      // menuLinks: [[...this.landingConfig.menuLinks]],
      // socialLinks: [[...this.landingConfig.socialLinks]],
      // themes: [[...this.landingConfig.themes]]
    });
    console.log(this.landingConfig, this.landingForm);
  }
}

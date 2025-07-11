import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LandingBannerDTO from '@data/models/landing/landing-banner-dto';
import { LandingService } from '@data/services/landing.service';
import { MediaViewerService } from '@modules/feature-modules/media-viewer-dialog/media-viewer.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-landing-banners',
  templateUrl: './landing-banners.component.html',
  styleUrls: ['./landing-banners.component.scss']
})
export class LandingBannersComponent implements OnInit {
  public labels = {
    banners: marker('landing.bannersComponent.banners'),
    newLink: marker('landing.bannersComponent.newLink'),
    title: marker('landing.bannersComponent.title'),
    description: marker('landing.bannersComponent.description'),
    link: marker('landing.bannersComponent.link'),
    image: marker('landing.bannersComponent.image'),
    nameLink: marker('landing.bannersComponent.nameLink'),
    initDate: marker('landing.bannersComponent.initDate'),
    endDate: marker('landing.bannersComponent.endDate'),
    save: marker('common.save')
  };
  public minLength = 3;
  public bannerList: LandingBannerDTO[];
  public formBanner: UntypedFormArray;
  constructor(
    private landingService: LandingService,
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private mediaViewerService: MediaViewerService
  ) {}

  get banner() {
    return this.formBanner as UntypedFormArray;
  }
  public submit(): void {
    const banners = this.formBanner.getRawValue();
    const spinner = this.spinnerService.show();
    this.landingService
      .saveBanners(banners)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: LandingBannerDTO[]) => {
          this.bannerList = data ? data : null;
          this.initializeForm();
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

  public openAttachment(banner: UntypedFormGroup): void {
    const bannerBody = banner.getRawValue();
    if (bannerBody.image && bannerBody.image.content) {
      this.mediaViewerService.openMediaViewer(bannerBody.image.content);
    } else if (bannerBody.image && bannerBody.id) {
      const spinner = this.spinnerService.show();
      this.landingService
        .getBannerDetail(bannerBody.id)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe({
          next: (data) => {
            this.mediaViewerService.openMediaViewer(data.image);
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    }
  }
  public newBanner() {
    this.banner.push(
      this.fb.group({
        orderNumber: [this.banner.length + 1, [Validators.required]],
        title: [this.translateService.instant(this.labels.nameLink), [Validators.required]],
        link: ['', [Validators.required]],
        image: [null, [Validators.required]],
        fileName: ['', [Validators.required]],
        initDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        description: ['']
      })
    );
  }
  public addFile(files: FileList, link: UntypedFormGroup): void {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result as string;
      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: result.split(';base64,')[1]
      };
      link.get('image').setValue(fileInfo);
      link.get('fileName').setValue(fileInfo.name);
    };
    reader.readAsDataURL(file);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.banner, event.previousIndex, event.currentIndex);
  }
  public deleteBanner(banner: UntypedFormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteLinkConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          if (banner.value.id) {
            const spinner = this.spinnerService.show();
            this.landingService
              .deleteBanner(banner.value.id)
              .pipe(
                take(1),
                finalize(() => {
                  this.spinnerService.hide(spinner);
                })
              )
              .subscribe({
                next: () => {
                  removeItemInFormArray(this.banner, banner.value.orderNumber - 1);
                },
                error: (error) => {
                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              });
          } else {
            removeItemInFormArray(this.banner, banner.value.orderNumber - 1);
          }
        }
      });
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.landingService
      .getBanners()
      .pipe(
        take(1),
        finalize(() => {
          this.initializeForm();
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (data) => {
          this.bannerList = data ? data : [];
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  private initializeForm = (): void => {
    this.bannerList = this.bannerList.sort((a: LandingBannerDTO, b: LandingBannerDTO) => {
      if (a.orderNumber > b.orderNumber) {
        return 1;
      } else {
        return -1;
      }
    });
    this.formBanner = this.fb.array([]);
    this.bannerList.forEach((banner) => {
      this.banner.push(
        this.fb.group({
          id: [banner.id],
          orderNumber: [banner.orderNumber, [Validators.required]],
          image: [banner.image, [Validators.required]],
          fileName: [banner?.image?.name, [Validators.required]],
          link: [banner.link, [Validators.required]],
          title: [banner.title, [Validators.required]],
          initDate: [new Date(banner.initDate), [Validators.required]],
          endDate: [new Date(banner.endDate), [Validators.required]],
          description: [banner.description]
        })
      );
    });
  };
}

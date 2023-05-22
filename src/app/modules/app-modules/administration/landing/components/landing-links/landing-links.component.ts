import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import LandingLinkDTO from '@data/models/landing/landing-link-dto';
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
  selector: 'app-landing-links',
  templateUrl: './landing-links.component.html',
  styleUrls: ['./landing-links.component.scss']
})
export class LandingLinksComponent implements OnInit {
  public labels = {
    social: marker('landing.linksComponent.social'),
    menu: marker('landing.linksComponent.menu'),
    newLink: marker('landing.linksComponent.newLink'),
    name: marker('landing.linksComponent.name'),
    link: marker('landing.linksComponent.link'),
    icon: marker('landing.linksComponent.icon'),
    nameLink: marker('landing.linksComponent.nameLink'),
    save: marker('common.save')
  };
  public minLength = 3;
  public linkList: LandingLinkDTO[];
  public formSocial: UntypedFormArray;
  public formMenu: UntypedFormArray;
  constructor(
    private landingService: LandingService,
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private mediaViewerService: MediaViewerService
  ) {}

  get social() {
    return this.formSocial as UntypedFormArray;
  }
  get menu() {
    return this.formMenu as UntypedFormArray;
  }

  public submit(): void {
    const links = [...this.formMenu.getRawValue(), ...this.formSocial.getRawValue()];
    const spinner = this.spinnerService.show();
    this.landingService
      .saveLinks(links)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: LandingLinkDTO[]) => {
          this.linkList = data ? data : null;
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

  public openAttachment(link: UntypedFormGroup): void {
    const linkBody = link.getRawValue();
    if (linkBody.icon && linkBody.icon.content) {
      this.mediaViewerService.openMediaViewer(linkBody.icon.content);
    } else if (linkBody.icon && linkBody.id) {
      const spinner = this.spinnerService.show();
      this.landingService
        .getLinkDetail(linkBody.id)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe({
          next: (data) => {
            this.mediaViewerService.openMediaViewer(data.icon);
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
  public newLink(type: string) {
    if (type === 'SOCIAL') {
      this.social.push(
        this.fb.group({
          orderNumber: [this.social.length + 1, [Validators.required]],
          name: [this.translateService.instant(this.labels.nameLink), [Validators.required]],
          link: ['', [Validators.required]],
          icon: [null, [Validators.required]],
          fileName: ['', [Validators.required]],
          typeLink: ['SOCIAL', [Validators.required]]
        })
      );
    } else if (type === 'MENU') {
      this.menu.push(
        this.fb.group({
          orderNumber: [this.menu.length + 1, [Validators.required]],
          name: [this.translateService.instant(this.labels.nameLink), [Validators.required]],
          link: ['', [Validators.required]],
          typeLink: ['MENU', [Validators.required]]
        })
      );
    }
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
      link.get('icon').setValue(fileInfo);
      link.get('fileName').setValue(fileInfo.name);
    };
    reader.readAsDataURL(file);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<string[]>, type: string) {
    if (type === 'SOCIAL') {
      moveItemInFormArray(this.social, event.previousIndex, event.currentIndex);
    } else if (type === 'MENU') {
      moveItemInFormArray(this.menu, event.previousIndex, event.currentIndex);
    }
  }
  public deleteLink(link: UntypedFormGroup, type: string) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteLinkConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          if (link.value.id) {
            const spinner = this.spinnerService.show();
            this.landingService
              .deleteLinks(link.value.id)
              .pipe(
                take(1),
                finalize(() => {
                  this.spinnerService.hide(spinner);
                })
              )
              .subscribe({
                next: () => {
                  if (type === 'SOCIAL') {
                    removeItemInFormArray(this.social, link.value.orderNumber - 1);
                  } else if (type === 'MENU') {
                    removeItemInFormArray(this.menu, link.value.orderNumber - 1);
                  }
                },
                error: (error) => {
                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              });
          } else {
            if (type === 'SOCIAL') {
              removeItemInFormArray(this.social, link.value.orderNumber - 1);
            } else if (type === 'MENU') {
              removeItemInFormArray(this.menu, link.value.orderNumber - 1);
            }
          }
        }
      });
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.landingService
      .getLinks()
      .pipe(
        take(1),
        finalize(() => {
          this.initializeForm();
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe({
        next: (data) => {
          this.linkList = data ? data : [];
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
    this.linkList = this.linkList.sort((a: LandingLinkDTO, b: LandingLinkDTO) => {
      if (a.orderNumber > b.orderNumber) {
        return 1;
      } else {
        return -1;
      }
    });
    this.formSocial = this.fb.array([]);
    this.formMenu = this.fb.array([]);
    this.linkList.forEach((link) => {
      if (link.typeLink === 'SOCIAL') {
        this.social.push(
          this.fb.group({
            id: [link.id],
            orderNumber: [link.orderNumber, [Validators.required]],
            name: [link.name, [Validators.required]],
            link: [link.link, [Validators.required]],
            icon: [link.icon, [Validators.required]],
            fileName: [link.icon.name, [Validators.required]],
            typeLink: [link.typeLink, [Validators.required]]
          })
        );
      } else if (link.typeLink === 'MENU') {
        this.menu.push(
          this.fb.group({
            id: [link.id],
            orderNumber: [link.orderNumber, [Validators.required]],
            name: [link.name, [Validators.required]],
            link: [link.link, [Validators.required]],
            typeLink: [link.typeLink, [Validators.required]]
          })
        );
      }
    });
  };
}

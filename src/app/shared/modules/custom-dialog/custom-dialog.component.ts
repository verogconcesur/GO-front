import { AfterViewInit, Component, ComponentRef, Inject, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentToExtendForCustomDialog } from './models/component-for-custom-dialog';
import { CustomDialogConfigI } from './interfaces/custom-dialog-config';
import { CustomDialogHeaderConfigI } from './interfaces/custom-dialog-header-config';
import { take } from 'rxjs/operators';
import { ConcenetError } from '@app/types/error';
import { CustomDialogFooterConfig } from './models/custom-dialog-footer-config';
import { CustomDialogService } from './services/custom-dialog.service';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('customContainerRef', { read: ViewContainerRef, static: true }) public dynamicViewContainer: ViewContainerRef;
  public headerConfig: CustomDialogHeaderConfigI = {};
  public footerConfig: CustomDialogFooterConfig = null;
  private componentRef: ComponentRef<ComponentToExtendForCustomDialog> = null;

  constructor(
    public dialogRef: MatDialogRef<ComponentToExtendForCustomDialog>,
    private customDialogService: CustomDialogService,
    @Inject(MAT_DIALOG_DATA) public config: CustomDialogConfigI
  ) {}

  ngAfterViewInit(): void {
    this.loadInnerModalComponent();
    this.getComponentConfiguration();
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }

  public closeAction(): void {
    if (this.componentRef.instance.confirmCloseCustomDialog) {
      this.componentRef.instance
        .confirmCloseCustomDialog()
        .pipe(take(1))
        .subscribe({
          next: ok => {
            if (ok) {
              this.close(false);
            }
          },
          error: (error: ConcenetError) => {
            console.log(error);
          }
        });
    } else {
      this.close(false);
    }
  }

  public submitAction(): void {
    if (this.componentRef.instance.onSubmitCustomDialog) {
      this.componentRef.instance
        .onSubmitCustomDialog()
        .pipe(take(1))
        .subscribe({
          next: ok => {
            if (ok) {
              this.close(ok);
            }
          },
          error: (error: ConcenetError) => {
            console.log(error);
          }
        });
    } else {
      this.close(true);
    }
  }

  private loadInnerModalComponent(): void {
    this.componentRef = this.dynamicViewContainer.createComponent(this.config.component);
    this.componentRef.instance.setModalModeActive(true);
    if (this.config.extendedComponentData) {
      this.componentRef.instance.extendedComponentData = this.config.extendedComponentData;
    }
  }

  private getComponentConfiguration(): void {
    this.headerConfig.titleLabel = this.componentRef.instance.MODAL_TITLE;
    this.footerConfig = new CustomDialogFooterConfig(this.componentRef.instance.setAndGetFooterConfig());
  }

  private close(result: boolean): void {
    this.dialogRef.close(result);
  }
}

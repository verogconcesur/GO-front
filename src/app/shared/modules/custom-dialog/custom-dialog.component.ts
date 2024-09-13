import {
  AfterViewInit,
  Component,
  ComponentRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentToExtendForCustomDialog } from './models/component-for-custom-dialog';
import { CustomDialogConfigI } from './interfaces/custom-dialog-config';
import { CustomDialogHeaderConfigI } from './interfaces/custom-dialog-header-config';
import { take } from 'rxjs/operators';
import { CustomDialogFooterConfig } from './models/custom-dialog-footer-config';
import { CustomDialogService } from './services/custom-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss'],
})
export class CustomDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('customContainerRef', { read: ViewContainerRef, static: true })
  public dynamicViewContainer!: ViewContainerRef;
  public headerConfig: CustomDialogHeaderConfigI = {};
  public footerConfig!: CustomDialogFooterConfig;
  private componentRef!: ComponentRef<ComponentToExtendForCustomDialog>;

  constructor(
    public dialogRef: MatDialogRef<ComponentToExtendForCustomDialog>,
    private customDialogService: CustomDialogService,
    @Inject(MAT_DIALOG_DATA) public config: CustomDialogConfigI
  ) {}

  ngOnInit(): void {
    this.customDialogService.closeResult$
      .pipe(untilDestroyed(this))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((data: { id: string; result: any }) => {
        if (data.id === this.componentRef?.instance.MODAL_ID) {
          this.close(data.result);
        }
      });
  }

  ngAfterViewInit(): void {
    this.loadInnerModalComponent();
    setTimeout(() => {
      this.changeTitle();
      this.getComponentConfiguration();
    });
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
  }

  public closeAction(): void {
    if (this.componentRef?.instance.confirmCloseCustomDialog) {
      this.componentRef.instance
        .confirmCloseCustomDialog()
        .pipe(take(1))
        .subscribe({
          next: (ok) => {
            if (ok) {
              this.close(false);
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
    } else {
      this.close(false);
    }
  }

  public submitAction(): void {
    if (this.componentRef?.instance.onSubmitCustomDialog) {
      this.componentRef.instance
        .onSubmitCustomDialog()
        .pipe(take(1))
        .subscribe({
          next: (ok) => {
            if (ok) {
              this.close(ok);
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
    } else {
      this.close(true);
    }
  }

  public changeTitle(): void {
    this.headerConfig.titleLabel = this.componentRef?.instance.MODAL_TITLE;
  }

  private loadInnerModalComponent(): void {
    this.componentRef = this.dynamicViewContainer?.createComponent(
      this.config.component
    );
    this.componentRef?.instance.setModalModeActive(true);
    if (this.config.extendedComponentData && this.componentRef) {
      this.componentRef.instance.extendedComponentData =
        this.config.extendedComponentData;
    }
  }

  private getComponentConfiguration(): void {
    this.footerConfig = new CustomDialogFooterConfig(
      this.componentRef.instance.setAndGetFooterConfig()
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private close(result: any): void {
    this.dialogRef.close(result);
  }
}

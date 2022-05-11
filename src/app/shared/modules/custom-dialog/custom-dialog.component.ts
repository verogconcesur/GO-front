import { AfterViewInit, Component, ComponentRef, Inject, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentForCustomDialog } from './models/component-for-custom-dialog';
import { CustomDialogConfigI } from './interfaces/custom-dialog-config';
import { CustomDialogHeaderConfigI } from './interfaces/custom-dialog-header-config';
import { take } from 'rxjs/operators';
import { ConcenetError } from '@app/types/error';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent implements AfterViewInit, OnDestroy {

  @ViewChild('customContainerRef', { read: ViewContainerRef, static: true }) public dynamicViewContainer: ViewContainerRef;
  public headerConfig: CustomDialogHeaderConfigI = {};
  private componentRef: ComponentRef<ComponentForCustomDialog> = null;

  constructor(
    public dialogRef: MatDialogRef<ComponentForCustomDialog>,
    @Inject(MAT_DIALOG_DATA) public config: CustomDialogConfigI,
  ) { }

  ngAfterViewInit(): void {
    this.loadInnerModalComponent();
    this.getComponentConfiguration();
  }

  ngOnDestroy(): void {
    this.componentRef.destroy();
  }

  public closeAction(): void {
    if(this.componentRef.instance.confirmCloseCustomDialog){
      this.componentRef.instance.confirmCloseCustomDialog()
      .pipe(take(1))
      .subscribe({
        next: (ok) => {
          if(ok){
            this.close();
          }
        },
        error: (error: ConcenetError) => {
          console.log(error);
        }
      });
    }else{
      this.close();
    }
  }

  private loadInnerModalComponent(): void {
    this.componentRef = this.dynamicViewContainer.createComponent(this.config.component);
    this.componentRef.instance.setModalModeActive(true);
  }

  private getComponentConfiguration(): void {
    this.headerConfig.titleLabel = this.componentRef.instance.MODAL_TITLE;
  }

  private close(): void {
    this.dialogRef.close(true);
  }

}


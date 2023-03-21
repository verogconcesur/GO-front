import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RepairOrderEntityApiDTO from '@data/models/entities/repair-order-entity-api-dto';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import RepairOrderFilterDTO from '@data/models/entities/repair-order-filter-dto';
import { EntitiesService } from '@data/services/entities.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { finalize, catchError, take, map } from 'rxjs/operators';

export const enum CreateEditRepairOrderExternalApiComponentModalEnum {
  ID = 'create-edit-repair-order-external-api-dialog-id',
  PANEL_CLASS = 'create-edit-external-api-repair-order-dialog',
  TITLE = 'entities.repairOrders.import'
}
@Component({
  selector: 'app-modal-repair-order-external-api',
  templateUrl: './modal-repair-order-external-api.component.html',
  styleUrls: ['./modal-repair-order-external-api.component.scss']
})
export class ModalRepairOrderExternalApiComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.repairOrders.import'),
    reference: marker('entities.repairOrders.reference'),
    jobsDescription: marker('entities.repairOrders.jobsDescription'),
    search: marker('common.search'),
    dataNotFound: marker('newCard.errors.dataNotFound'),
    repairOrderNotFound: marker('newCard.errors.repairOrderNotFound'),
    minLength: marker('errors.minLength'),
    data: marker('userProfile.data')
  };
  public minLength = 3;
  public facilityId: number;
  public repairOrderList: RepairOrderEntityApiDTO[] = [];
  public repairOrderSelected: RepairOrderEntityApiDTO;
  public searchForm: FormGroup;
  public activatedSearch = false;
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService
  ) {
    super(
      CreateEditRepairOrderExternalApiComponentModalEnum.ID,
      CreateEditRepairOrderExternalApiComponentModalEnum.PANEL_CLASS,
      CreateEditRepairOrderExternalApiComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.facilityId = this.extendedComponentData.facility;
    this.initializeForm();
  }

  ngOnDestroy(): void {}
  public search() {
    const spinner = this.spinnerService.show();
    this.repairOrderSelected = null;
    const searchBody: RepairOrderFilterDTO = {
      facilityId: this.facilityId,
      reference: this.searchForm.getRawValue().search
    };
    this.entitiesService
      .searchRepairOrdersApi(searchBody)
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        (res) => {
          this.repairOrderList = res && res.length ? res : [];
          this.activatedSearch = true;
          if (this.repairOrderList.length === 1) {
            this.repairOrderSelected = this.repairOrderList[0];
          }
        },
        (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
  public selectEntity(repairOrder: RepairOrderEntityApiDTO) {
    this.repairOrderSelected = repairOrder;
    this.searchForm.get('search').setValue(repairOrder.reference);
  }
  public transformOptionLabel(repairOrder: RepairOrderEntityApiDTO) {
    return repairOrder.reference;
  }
  public showError(): boolean {
    return this.repairOrderList.length === 0 && this.activatedSearch;
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.repairOrderSelected) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | RepairOrderEntityDTO> {
    const spinner = this.spinnerService.show();
    return this.entitiesService.createRepairOrderApi(this.repairOrderSelected.repairOrderId, this.facilityId).pipe(
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
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.repairOrderSelected
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.searchForm = this.fb.group({
      search: ['', [Validators.required, Validators.minLength(this.minLength)]]
    });
  };
}

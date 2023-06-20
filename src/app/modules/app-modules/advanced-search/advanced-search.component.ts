import { Component, OnInit, ViewChild } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin, take } from 'rxjs';
import { AdvSearchCardTableComponent } from './components/adv-search-card-table/adv-search-card-table.component';
import { NGXLogger } from 'ngx-logger';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import FacilityDTO from '@data/models/organization/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  AdvSearchCriteriaDialogComponent,
  AdvSearchCriteriaDialogComponentModalEnum
} from './components/adv-search-criteria-dialog/adv-search-criteria-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {
  @ViewChild('searchTable') table: AdvSearchCardTableComponent;
  @ViewChild('favDrawer') favDrawer: MatDrawer;
  @ViewChild('drawerCont') drawerCont: MatDrawer;
  public labels = {
    favSearch: marker('advSearch.favSearch'),
    savedSearch: marker('advSearch.savedSearch'),
    critSearch: marker('advSearch.critSearch'),
    context: marker('advSearch.context'),
    customCol: marker('advSearch.customCol'),
    cleanConf: marker('advSearch.cleanConf'),
    export: marker('advSearch.export'),
    saveFav: marker('advSearch.saveFav'),
    addFilter: marker('advSearch.addFilter'),
    addColumn: marker('advSearch.addColumn'),
    facilities: marker('administration.facilities'),
    workflows: marker('administration.workflows'),
    states: marker('advSearch.states'),
    subStates: marker('advSearch.subStates'),
    initDate: marker('advSearch.initDate'),
    endDate: marker('advSearch.endDate'),
    search: marker('common.search')
  };
  public advSearchFav: AdvSearchDTO[] = [];
  public facilityList: FacilityDTO[] = [];
  public workflowList: WorkflowCreateCardDTO[] = [];
  public criteriaOptions: AdvancedSearchOptionsDTO = { cards: {}, entities: {} };
  public advSearchForm: FormGroup;
  public modeDrawer: 'criteria' | 'context' | 'column';
  constructor(
    private advSearchService: AdvSearchService,
    private facilityService: FacilityService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private confirmationDialog: ConfirmDialogService,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private admService: AuthenticationService,
    private customDialogService: CustomDialogService
  ) {}
  initForm(advSearch?: AdvSearchDTO, edit?: boolean) {
    this.advSearchForm = this.fb.group({
      id: [],
      name: [],
      unionType: ['TYPE_AND'],
      userId: [this.admService.getUserId()],
      context: this.fb.group({
        facilities: [[]],
        workflows: [[]],
        states: [[]],
        substates: [[]],
        initDate: [new Date(), Validators.required],
        endDate: [new Date(), Validators.required]
      }),
      advancedSearchItems: this.fb.array([]),
      advancedSearchCols: this.fb.array([])
    });
  }
  cleanFilters(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.continueNewSearch'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.initForm();
        }
      });
  }
  openFilters(mode: 'criteria' | 'context' | 'column'): void {
    if (!this.drawerCont.opened) {
      this.drawerCont.toggle();
    } else if (this.modeDrawer === mode) {
      this.drawerCont.toggle();
    }
    this.modeDrawer = mode;
  }
  refreshFavSearchList(): void {
    const spinner = this.spinnerService.show();
    this.advSearchService
      .getAdvSearchList()
      .pipe(take(1))
      .subscribe({
        next: (response: AdvSearchDTO[]) => {
          this.advSearchFav = response ? response : [];
          this.spinnerService.hide(spinner);
        },
        error: (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  duplicateFavSearch(advSearch: AdvSearchDTO): void {
    const spinner = this.spinnerService.show();
    this.advSearchService
      .duplicateAdvSearch(advSearch.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.spinnerService.hide(spinner);
          this.refreshFavSearchList();
        },
        error: (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  deleteFavSearch(advSearch: AdvSearchDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.advSearchService
            .deleteAdvSearchById(advSearch.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.spinnerService.hide(spinner);
                this.refreshFavSearchList();
              },
              error: (error: ConcenetError) => {
                this.spinnerService.hide(spinner);
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  getFavSearch(advSearch: AdvSearchDTO, edit?: boolean): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.continueNewSearch'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.advSearchService
            .getAdvSearchById(advSearch.id)
            .pipe(take(1))
            .subscribe({
              next: (advSearchDetail) => {
                this.initForm(advSearchDetail, edit);
                this.table.executeSearch(advSearchDetail);
                this.favDrawer.toggle();
                this.spinnerService.hide(spinner);
              },
              error: (error: ConcenetError) => {
                this.spinnerService.hide(spinner);
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  addCriteriaFilter(): void {
    console.log(this.criteriaOptions, this.advSearchForm.get('advancedSearchItems').value);
    this.customDialogService.open({
      component: AdvSearchCriteriaDialogComponent,
      extendedComponentData: { options: this.criteriaOptions, selected: this.advSearchForm.get('advancedSearchItems').value },
      id: AdvSearchCriteriaDialogComponentModalEnum.ID,
      panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
      disableClose: true,
      width: '700px'
    });
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    const resquests = [
      this.advSearchService.getAdvSearchList().pipe(take(1)),
      this.facilityService.getFacilitiesByBrandsIds().pipe(take(1)),
      this.advSearchService.getWorkflowList().pipe(take(1)),
      this.advSearchService.getCriteria().pipe(take(1))
    ];
    forkJoin(resquests).subscribe({
      next: (responses: [AdvSearchDTO[], FacilityDTO[], WorkflowCreateCardDTO[], AdvancedSearchOptionsDTO]) => {
        this.advSearchFav = responses[0] ? responses[0] : [];
        this.facilityList = responses[1] ? responses[1] : [];
        this.workflowList = responses[2] ? responses[2] : [];
        this.criteriaOptions = responses[3] ? responses[3] : { cards: {}, entities: {} };
        this.initForm();
        this.spinnerService.hide(spinner);
      },
      error: (error: ConcenetError) => {
        this.spinnerService.hide(spinner);
        this.logger.error(error);
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
      }
    });
  }
}

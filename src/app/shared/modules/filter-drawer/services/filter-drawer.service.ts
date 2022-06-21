/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from '@angular/cdk/portal';
import { ComponentRef, EventEmitter, Injectable, OnDestroy, ViewContainerRef } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { areObjectsEqualsWithDeepComparation } from '@shared/utils/objects-comparation-function';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { FilterDrawerClassToExnted } from '../models/filter-drawer-class-to-extend.component';

@Injectable({
  providedIn: 'root'
})
export class FilterDrawerService implements OnDestroy {
  public filterValueSubject$: BehaviorSubject<any> = new BehaviorSubject(null);
  private FILTER_DRAWER_COMPONENT_ERROR = 'Filter drawer component or inner ref component not defined.';
  private FILTER_DRAWER_INNER_COMPONENT_ERROR = 'There is no component defined to show inside the filter drawer.';
  private filterDrawerComponent: MatDrawer;
  private filterDrawerInnerRef: ViewContainerRef;
  private filterDrawerInnerComponentRef: ComponentRef<FilterDrawerClassToExnted> = null;
  private disableCloseEmitter: EventEmitter<boolean>;
  private disableCloseValue = false;
  private componentToShowInFilterDrawer: ComponentType<FilterDrawerClassToExnted>;
  private filterValueOnOpen: any;

  constructor(private confirmationDialog: ConfirmDialogService, private translateService: TranslateService) {}

  ngOnDestroy(): void {
    this.filterValueSubject$.next(null);
    this.filterDrawerComponent = null;
    this.filterDrawerInnerRef = null;
    this.componentToShowInFilterDrawer = null;
  }

  public setFilterDrawerComponent(
    reference: MatDrawer,
    innerContainer: ViewContainerRef,
    disableCloseEmitter: EventEmitter<boolean>
  ): void {
    this.filterDrawerComponent = reference;
    this.filterDrawerInnerRef = innerContainer;
    this.disableCloseEmitter = disableCloseEmitter;
    this.printComponentInFilterDrawer();
  }

  public setComponentToShowInsideFilterDrawer(component: ComponentType<FilterDrawerClassToExnted>): void {
    this.componentToShowInFilterDrawer = component;
    this.printComponentInFilterDrawer();
  }

  public toggleFilterDrawer(): void {
    if (!this.filterDrawerComponent || !this.filterDrawerInnerRef) {
      console.error(this.FILTER_DRAWER_COMPONENT_ERROR);
      return;
    } else if (!this.componentToShowInFilterDrawer) {
      console.error(this.FILTER_DRAWER_INNER_COMPONENT_ERROR);
      return;
    }
    this.filterDrawerComponent.toggle();
    if (this.filterDrawerComponent.opened) {
      this.filterValueOnOpen = this.filterValueSubject$.getValue();
    }
  }

  public closeFilter(): void {
    if (
      (this.filterValueOnOpen || (!this.filterValueOnOpen && this.isFilterFormTouchedOrDirty())) &&
      !areObjectsEqualsWithDeepComparation(
        this.filterValueOnOpen,
        this.filterDrawerInnerComponentRef.instance.getFilterFormValue()
      )
    ) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.unsavedChangesExit'))
        })
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            this.filterDrawerInnerComponentRef?.instance?.resetFilter(this.filterValueOnOpen).pipe(take(1));
            this.toggleFilterDrawer();
          }
        });
    } else {
      this.toggleFilterDrawer();
    }
  }
  public resetFilter(): void {
    this.filterDrawerInnerComponentRef?.instance?.resetFilter().pipe(take(1));
  }
  public submitFilter(): void {
    this.filterDrawerInnerComponentRef?.instance
      ?.submitFilter()
      .pipe(take(1))
      .subscribe((value: any) => {
        this.filterValueSubject$.next(value);
        this.toggleFilterDrawer();
      });
  }
  public isSubmitFilterButtonDisabled(): boolean {
    if (!this.filterDrawerInnerComponentRef?.instance) {
      return true;
    } else if (
      !areObjectsEqualsWithDeepComparation(
        this.filterValueOnOpen,
        this.filterDrawerInnerComponentRef.instance.getFilterFormValue()
      ) &&
      this.isFilterFormTouchedOrDirty() &&
      this.filterDrawerInnerComponentRef.instance.isFilterFormValid()
    ) {
      return false;
    } else if (
      !this.isFilterFormTouchedOrDirty() &&
      this.filterDrawerInnerComponentRef.instance.isFilterFormValid() &&
      !areObjectsEqualsWithDeepComparation(
        this.filterValueOnOpen,
        this.filterDrawerInnerComponentRef.instance.getFilterFormValue()
      )
    ) {
      return false;
    }
    return true;
  }

  public isFilterFormTouchedOrDirty(): boolean {
    const formTouchedOrDirty = this.filterDrawerInnerComponentRef?.instance?.isFilterFormTouchedOrDirty();
    if (formTouchedOrDirty !== this.disableCloseValue) {
      this.disableCloseValue = formTouchedOrDirty;
      this.disableCloseEmitter?.emit(formTouchedOrDirty);
    }
    return formTouchedOrDirty;
  }

  private printComponentInFilterDrawer(): void {
    if (this.filterDrawerComponent && this.filterDrawerInnerRef && this.componentToShowInFilterDrawer) {
      this.filterValueSubject$.next(null);
      this.filterDrawerInnerRef.clear();
      this.filterDrawerInnerComponentRef = this.filterDrawerInnerRef.createComponent(this.componentToShowInFilterDrawer);
      // this.filterDrawerInnerComponentRef.instance.data = .....;
    }
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';

export enum TAB_IDS {
  GENERAL = 'GENERAL',
  STATE_PERMISSIONS = 'STATE_PERMISSIONS',
  MOVEMENTS = 'MOVEMENTS',
  EVENTS = 'EVENTS'
}

@Injectable({
  providedIn: 'root'
})
export class WEditSubstateFormAuxService {
  public saveAction$ = new Subject();
  public nextStep$ = new Subject();
  public resetForm$ = new Subject();
  public saveActionClicked = false;
  private formsOriginalData: any = {};
  private form: UntypedFormGroup;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  public destroy(): void {
    this.initForm();
    this.formsOriginalData = [];
  }

  public setFormGroupByTab = (form: UntypedFormGroup, idTab: TAB_IDS): void => {
    this.form.controls[idTab] = form;
  };

  public getFormGroupByTab = (idTab?: TAB_IDS): UntypedFormGroup => {
    if (idTab) {
      return this.form.get(idTab) as UntypedFormGroup;
    }
    return this.form;
  };

  public isFormGroupSettedAndNotDirtyOrTouched(id: TAB_IDS): boolean {
    return (
      this.form &&
      this.form.get(id) &&
      this.getFormGroupByTab(id).valid &&
      !this.getFormGroupByTab(id).dirty &&
      !this.getFormGroupByTab(id).touched
    );
  }

  public setFormOriginalData(data: any, idTab: TAB_IDS): void {
    this.formsOriginalData[idTab] = data;
  }

  public getFormOriginalData(id: TAB_IDS): any {
    return this.formsOriginalData[id];
  }

  public saveTab(nextStep: boolean): void {
    this.saveActionClicked = true;
    this.saveAction$.next(nextStep);
  }

  public resetForm(): void {
    this.resetForm$.next(true);
  }

  private initForm(): void {
    this.form = this.fb.group({
      GENERAL: this.fb.group({}),
      STATE_PERMISSIONS: this.fb.group({}),
      MOVEMENTS: this.fb.group({}),
      EVENTS: this.fb.group({})
    });
  }
}

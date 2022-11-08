/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsCreateEditAuxService {
  public saveAction$ = new Subject();
  public nextStep$ = new Subject();
  public resetForm$ = new Subject();
  private formsByStep: UntypedFormGroup[] = [];
  private formsOriginalData: any[] = [];

  constructor() {}

  public setFormGroupByStep(form: UntypedFormGroup, index: number): void {
    this.formsByStep[index] = form;
  }

  public getFormGroupByStep(index: number): UntypedFormGroup {
    return this.formsByStep[index];
  }

  public setFormOriginalData(data: any, index: number): void {
    this.formsOriginalData[index] = data;
  }

  public getFormOriginalData(index: number): any {
    return this.formsOriginalData[index];
  }

  public enableTabStep(prevStepIndex: number): boolean {
    let enable = true;
    for (let i = 0; i <= prevStepIndex; i++) {
      if (enable) {
        enable =
          this.formsByStep &&
          this.formsByStep[i] &&
          this.getFormGroupByStep(i).valid &&
          !this.getFormGroupByStep(i).dirty &&
          !this.getFormGroupByStep(i).touched;
      }
    }
    return enable;
  }

  public saveAndGoNextStep(nextStep: boolean): void {
    this.saveAction$.next(nextStep);
  }

  public resetForm(): void {
    this.resetForm$.next(true);
  }
}

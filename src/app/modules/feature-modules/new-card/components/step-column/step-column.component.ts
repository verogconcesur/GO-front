import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormArray } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { StepColumnService } from './step-column.service';

@Component({
  selector: 'app-step-column',
  templateUrl: './step-column.component.html',
  styleUrls: ['./step-column.component.scss']
})
export class StepColumnComponent implements OnInit, OnDestroy {
  @Input() formStep: FormGroup;
  @Input() formWorkflow: FormGroup;
  @Input() title: string;
  constructor(private steperService: StepColumnService) {}
  get tabs(): UntypedFormArray {
    return this.formStep.get('tabs') as UntypedFormArray;
  }
  ngOnInit(): void {
    this.trackFormChanges();
  }
  ngOnDestroy(): void {
    this.steperService.resetVariables();
  }
  private trackFormChanges(): void {
    this.tabs.controls.forEach((tab) => {
      tab.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
        if (value.customerId) {
          this.steperService.setCustomerId(value.customerId);
        }

        if (value.vehicleId) {
          this.steperService.setVehicleId(value.vehicleId);
        }
      });
    });
  }
}

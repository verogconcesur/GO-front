import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormArray } from '@angular/forms';

@Component({
  selector: 'app-step-column',
  templateUrl: './step-column.component.html',
  styleUrls: ['./step-column.component.scss']
})
export class StepColumnComponent implements OnInit {
  @Input() formStep: FormGroup;
  @Input() formWorkflow: FormGroup;
  @Input() title: string;
  constructor() {}
  get tabs(): UntypedFormArray {
    return this.formStep.get('tabs') as UntypedFormArray;
  }
  ngOnInit(): void {}
}

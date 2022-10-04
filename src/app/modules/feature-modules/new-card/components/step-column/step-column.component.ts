import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step-column',
  templateUrl: './step-column.component.html',
  styleUrls: ['./step-column.component.scss']
})
export class StepColumnComponent implements OnInit {
  @Input() formStep: FormGroup;
  @Input() title: string;
  constructor() {}

  ngOnInit(): void {}
}

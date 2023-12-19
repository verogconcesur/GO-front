import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { WorkflowRequiredFieldsAuxService } from '@modules/app-modules/workflow/aux-service/workflow-required-fields-aux.service';

@Component({
  selector: 'app-item-input',
  templateUrl: './item-input.component.html',
  styleUrls: ['./item-input.component.scss']
})
export class ItemInputComponent implements OnInit {
  @Input() tab: CardColumnTabDTO;
  @Input() cardInstance: CardInstanceDTO;
  @Input() tabItem: CardColumnTabItemDTO;
  @Input() tabItemForm: FormGroup;
  @Input() editMode: boolean;
  public labels = {
    required: marker('errors.required')
  };
  constructor(public requiredFieldsAuxService: WorkflowRequiredFieldsAuxService) {}
  ngOnInit(): void {}
}

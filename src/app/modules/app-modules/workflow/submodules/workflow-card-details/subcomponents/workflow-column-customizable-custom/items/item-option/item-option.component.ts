import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { WorkflowRequiredFieldsAuxService } from '@modules/app-modules/workflow/aux-service/workflow-required-fields-aux.service';

@Component({
  selector: 'app-item-option',
  templateUrl: './item-option.component.html',
  styleUrls: ['./item-option.component.scss']
})
export class ItemOptionComponent implements OnInit {
  @Input() tab: CardColumnTabDTO;
  @Input() cardInstance: CardInstanceDTO;
  @Input() tabItem: CardColumnTabItemDTO;
  @Input() tabItemForm: FormGroup;
  @Input() editMode: boolean;
  constructor(public requiredFieldsAuxService: WorkflowRequiredFieldsAuxService) {}
  ngOnInit(): void {}
}

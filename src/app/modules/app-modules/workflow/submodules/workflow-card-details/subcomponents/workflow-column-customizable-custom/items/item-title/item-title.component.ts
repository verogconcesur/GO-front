import { Component, Input, OnInit } from '@angular/core';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { WorkflowRequiredFieldsAuxService } from '@modules/app-modules/workflow/aux-service/workflow-required-fields-aux.service';

@Component({
  selector: 'app-item-title',
  templateUrl: './item-title.component.html',
  styleUrls: ['./item-title.component.scss']
})
export class ItemTitleComponent implements OnInit {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Input() tabItem: CardColumnTabItemDTO = null;

  constructor(public requiredFieldsAuxService: WorkflowRequiredFieldsAuxService) {}

  ngOnInit(): void {}
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceAttachmentsConfig from './card-instance-attachments-config-interface';

@Component({
  selector: 'app-card-instance-attachments',
  templateUrl: './card-instance-attachments.component.html',
  styleUrls: ['./card-instance-attachments.component.scss']
})
export class CardInstanceAttachmentsComponent implements OnInit, OnChanges {
  @Input() cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  @Input() data: CardAttachmentsDTO[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.cardInstanceAttachmentsConfig, this.data);
  }

  public addFiles(template: CardAttachmentsDTO) {
    console.log(template);
  }
}

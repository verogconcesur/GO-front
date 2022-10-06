import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceAttachmentsConfig from './card-instance-attachments-config-interface';

@Component({
  selector: 'app-card-instance-attachments',
  templateUrl: './card-instance-attachments.component.html',
  styleUrls: ['./card-instance-attachments.component.scss']
})
export class CardInstanceAttachmentsComponent implements OnInit, OnChanges {
  @Input() cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  @Input() data: CardAttachmentsDTO[] = [];
  public selectedAttachments: AttachmentDTO[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.cardInstanceAttachmentsConfig, this.data);
    this.selectedAttachments = [];
  }

  public addFiles(template: CardAttachmentsDTO) {
    console.log(template);
  }

  public selectItem(item: AttachmentDTO): void {
    if (this.selectedAttachments.indexOf(item) >= 0) {
      this.selectedAttachments.splice(this.selectedAttachments.indexOf(item), 1);
    } else {
      this.selectedAttachments.push(item);
    }
  }

  public isItemSelected(item: AttachmentDTO): boolean {
    if (this.selectedAttachments.indexOf(item) >= 0) {
      return true;
    }
    return false;
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-workflow-card-header',
  templateUrl: './workflow-card-header.component.html',
  styleUrls: ['./workflow-card-header.component.scss']
})
export class WorkflowCardHeaderComponent implements OnInit {
  @Input() card: CardInstanceDTO = null;

  public labels = {
    follow: marker('common.follow'),
    following: marker('common.following')
  };

  constructor() {}

  ngOnInit(): void {}

  public getColorsClass(): string {
    return `x-${this.card.colors.length}`;
  }

  public changeFollowingCard(): void {
    this.card.follower = !this.card.follower;
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDto from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-workflow-card-header',
  templateUrl: './workflow-card-header.component.html',
  styleUrls: ['./workflow-card-header.component.scss']
})
export class WorkflowCardHeaderComponent implements OnInit {
  @Input() card: CardInstanceDto = null;

  public labels = {
    follow: marker('common.follow'),
    following: marker('common.following')
  };

  constructor() {}

  ngOnInit(): void {}

  public getColors(): string[] {
    const colors: string[] = [];
    if (this.card?.workflowStateColor) {
      colors.push(this.card.workflowStateColor);
    }
    if (this.card?.workflowSubstateColor) {
      colors.push(this.card.workflowSubstateColor);
    }
    return colors;
  }

  public getColorsClass(): string {
    return `x-${this.getColors().length}`;
  }

  public changeFollowingCard(): void {
    this.card.follower = !this.card.follower;
  }
}

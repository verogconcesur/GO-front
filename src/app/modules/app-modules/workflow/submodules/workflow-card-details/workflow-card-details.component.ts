import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-workflow-card-details',
  templateUrl: './workflow-card-details.component.html',
  styleUrls: ['./workflow-card-details.component.scss']
})
export class WorkflowCardDetailsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public relativeTo: any = null;
  public card: WorkflowCardDto = null;
  public tabSelected: 'information' | 'workOrder' | 'messages' | 'actions' = 'information';
  public showMode: 'all' | 'semi' | 'individual' = 'all';
  public labels = {
    information: marker('common.information'),
    workOrder: marker('common.workOrder'),
    messages: marker('common.messages'),
    actions: marker('common.actions')
  };

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.setShowMode(event.target.innerWidth);
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (state.card) {
      this.card = JSON.parse(state.card);
    }
    this.setShowMode(window.innerWidth);
  }

  public setShowMode(width: number) {
    let showMode: 'all' | 'semi' | 'individual' = 'all';
    if (width <= 1400 && width > 1150) {
      showMode = 'semi';
    } else if (width <= 1150) {
      showMode = 'individual';
    }
    this.showMode = showMode;
  }

  public close(): void {
    if (this.relativeTo) {
      this.router.navigate([{ outlets: { card: null } }], {
        relativeTo: this.relativeTo
      });
    } else {
      const currentUrl = window.location.hash.split('#/').join('/').split('/(card:')[0];
      this.router.navigateByUrl(currentUrl);
    }
  }

  public isTabSelected(tab: 'information' | 'workOrder' | 'messages' | 'actions'): boolean {
    return this.tabSelected === tab;
  }

  public changeSelectedTab(tab: 'information' | 'workOrder' | 'messages' | 'actions'): void {
    this.tabSelected = tab;
  }

  public getContainerClass(): string {
    return this.showMode + ' ' + this.tabSelected;
  }
}

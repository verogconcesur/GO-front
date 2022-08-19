import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';

@Component({
  selector: 'app-workflow-card-details',
  templateUrl: './workflow-card-details.component.html',
  styleUrls: ['./workflow-card-details.component.scss']
})
export class WorkflowCardDetailsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public relativeTo: any = null;
  public card: WorkflowCardDto = null;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (state.card) {
      this.card = JSON.parse(state.card);
    }
  }

  public close(): void {
    console.log(this.route, this.route.parent.snapshot.params);
    if (this.relativeTo) {
      this.router.navigate([{ outlets: { card: null } }], {
        relativeTo: this.relativeTo
      });
    } else {
      const currentUrl = window.location.hash.split('#/').join('/').split('/(card:')[0];
      this.router.navigateByUrl(currentUrl);
    }
  }
}

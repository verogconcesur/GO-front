import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-card-searcher',
  templateUrl: './workflow-card-searcher.component.html',
  styleUrls: ['./workflow-card-searcher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowCardSearcherComponent implements OnInit {
  @Input() format: 'icon' | 'input';
  // @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  @ViewChild('inputModeTrigger') trigger: MatMenuTrigger;

  public labels = {
    search: marker('common.search')
  };
  public lastSearching: number;
  public searching = 0;
  public searcherForm: UntypedFormGroup;
  public cards: WorkflowCardDTO[] = [];

  constructor(private fb: FormBuilder, private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    this.initForm();
  }

  public initForm(): void {
    this.searcherForm = this.fb.group({
      search: [null]
    });
  }

  public closeIfNoCards(): void {
    console.log(this.trigger, this.trigger.menuOpen);
    if (this.cards.length === 0) {
      console.log('close');
      this.trigger.closeMenu();
    } else if (!this.trigger.menuOpen) {
      console.log('open');
      setTimeout(() => {
        this.trigger.openMenu();
      }, 100);
    }
  }

  public menuOpened() {
    console.log('menu opened');
  }

  public menuClosed() {
    console.log('menu closed');
  }

  public searchCards(): void {
    console.log(this.searcherForm, this.searcherForm.get('search')?.value);
    if (this.searcherForm.get('search')?.value?.length >= 3) {
      this.searching++;
      this.workflowService
        .searchCardsInWorkflows(this.searcherForm.get('search').value)
        .pipe(
          take(1),
          finalize(() => this.searching--)
        )
        .subscribe((data: WorkflowCardDTO[]) => {
          this.trigger.openMenu();
          this.cards = data;
        });
    }
  }
}

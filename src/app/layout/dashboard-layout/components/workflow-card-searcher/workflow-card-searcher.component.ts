import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { delay, finalize, map, switchMap, take } from 'rxjs/operators';

@UntilDestroy()
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
  public cards: { workflowId: number; workflowName: string; cards: WorkflowCardDTO[] }[] = [];
  filteredOptions: Observable<{ workflowId: number; workflowName: string; cards: WorkflowCardDTO[] }[]>;

  constructor(private fb: FormBuilder, private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    this.initForm();
    this.filteredOptions = this.searcherForm.get('search').valueChanges.pipe(
      untilDestroyed(this),
      switchMap((value) => {
        if (value?.length >= 3) {
          return this.filter(value);
        } else {
          return of([]);
        }
      })
    );
  }

  public initForm(): void {
    this.searcherForm = this.fb.group({
      search: [null]
    });
  }

  public cardSelected(card: WorkflowCardDTO): void {
    this.searcherForm.get('search').setValue(null);
    this.cards = [];
    console.log(card);
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

  // public menuOpened() {
  //   console.log('menu opened');
  // }

  // public menuClosed() {
  //   console.log('menu closed');
  // }

  // public searchCards(filterValue?: string): void {
  //   filterValue = filterValue ? filterValue : this.searcherForm.get('search')?.value;
  //   if (filterValue.length >= 3) {
  //     this.searching++;
  //     this.workflowService
  //       .searchCardsInWorkflows(this.searcherForm.get('search').value)
  //       .pipe(
  //         take(1),
  //         finalize(() => this.searching--)
  //       )
  //       .subscribe((data: WorkflowCardDTO[]) => {
  //         this.trigger.openMenu();
  //         this.cards = data;
  //       });
  //   }
  // }

  private filter(value?: string): Observable<{ workflowName: string; cards: WorkflowCardDTO[] }[]> {
    value = value ? value : this.searcherForm.get('search')?.value;
    const filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    this.searching++;
    return this.workflowService.searchCardsInWorkflows(filterValue).pipe(
      take(1),
      map((data: WorkflowCardDTO[]) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dataByWorkflow: any = {};
          data.forEach((card: WorkflowCardDTO) => {
            if (dataByWorkflow[card.cardInstanceWorkflows[0].workflowId]) {
              dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards = [
                ...dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards,
                card
              ];
            } else {
              dataByWorkflow[card.cardInstanceWorkflows[0].workflowId] = {
                workflowName: card.cardInstanceWorkflows[0].workflowName,
                workflowId: card.cardInstanceWorkflows[0].workflowId,
                cards: [card]
              };
            }
          });
          const result = Object.keys(dataByWorkflow).map((k) => dataByWorkflow[k]);
          console.log(result);
          this.cards = result;
          return result;
        } else {
          this.cards = [];
          return [];
        }
      }),
      finalize(() => this.searching--)
    );
  }
}

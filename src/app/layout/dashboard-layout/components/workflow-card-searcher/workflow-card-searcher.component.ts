import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
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

  public labels = {
    search: marker('common.search')
  };
  public lastSearching: number;
  public searching = 0;
  public filterValue: string;
  public searcherForm: UntypedFormGroup;
  public cards: WorkflowCardDTO[] = [];
  public paginationConfig = {
    length: 10,
    pageSize: 10,
    page: 0,
    first: true,
    last: false
  };
  public filteredOptions: Observable<WorkflowCardDTO[]>;

  constructor(private fb: FormBuilder, private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    this.initForm();
    this.filteredOptions = this.searcherForm.get('search').valueChanges.pipe(
      untilDestroyed(this),
      switchMap((value) => {
        if (value?.length >= 4) {
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
  }

  public showWorkflowName(index: number): boolean {
    if (this.cards?.length && index > 0) {
      const prevCard = this.cards[index - 1];
      const actualCard = this.cards[index];
      if (prevCard.cardInstanceWorkflows[0].workflowId === actualCard.cardInstanceWorkflows[0].workflowId) {
        return false;
      }
    }
    return true;
  }

  public onScroll(): void {
    console.log('fetch new data', this.paginationConfig);
  }

  private filter(value?: string): Observable<WorkflowCardDTO[]> {
    value = value ? value : this.searcherForm.get('search')?.value;
    this.filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    this.searching++;
    this.paginationConfig.page = 0;
    return this.fetchData();
  }

  private fetchData(): Observable<WorkflowCardDTO[]> {
    return this.workflowService.searchCardsInWorkflowsPaged(this.filterValue, this.paginationConfig).pipe(
      take(1),
      map((data: PaginationResponseI<WorkflowCardDTO>) => {
        if (data) {
          this.paginationConfig.length = data.totalElements;
          this.cards = data.content;
          return data.content;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // const dataByWorkflow: any = {};
          // data.content.forEach((card: WorkflowCardDTO) => {
          //   if (dataByWorkflow[card.cardInstanceWorkflows[0].workflowId]) {
          //     dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards = [
          //       ...dataByWorkflow[card.cardInstanceWorkflows[0].workflowId].cards,
          //       card
          //     ];
          //   } else {
          //     dataByWorkflow[card.cardInstanceWorkflows[0].workflowId] = {
          //       workflowName: card.cardInstanceWorkflows[0].workflowName,
          //       workflowId: card.cardInstanceWorkflows[0].workflowId,
          //       cards: [card]
          //     };
          //   }
          // });
          // const result = Object.keys(dataByWorkflow).map((k) => dataByWorkflow[k]);
          // this.cards = result;
          // return result;
        } else {
          this.cards = [];
          return [];
        }
      }),
      finalize(() => this.searching--)
    );
  }
}

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, take } from 'rxjs/operators';

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
  selectedAttribute = 'Referencia de la OR';
  selectedWorkflow = 'Todos los Workflows';

  attributes: string[] = [
    'Matrícula',
    'VIN',
    'Documento de identidad',
    'Referencia de la OR',
    'Identificador de la OR',
    'Número de comisión',
    'Etiqueta 1',
    'Etiqueta 2',
    'Etiqueta 3',
    'Nombre y apellidos del cliente'
  ];

  workflows: string[] = ['Workflow 1', 'Workflow 2', 'Workflow 3', 'Todos los Workflows'];

  public lastSearch: string[] = [];
  public searching = 0;
  public filterValue: string;
  public searcherForm: UntypedFormGroup;
  public cards: WorkflowCardDTO[] = [];
  public paginationConfig = {
    length: 10,
    pageSize: 10,
    page: 0,
    totalPages: 0,
    first: true,
    last: false
  };

  constructor(private fb: FormBuilder, private workflowService: WorkflowsService) {}

  ngOnInit(): void {
    this.initForm();
    this.searcherForm
      .get('search')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        if (value?.length >= 4) {
          this.filter(value);
        } else {
          this.cards = [];
        }
      });
  }

  onAutocompleteOpened() {
    console.log('Autocomplete abierto');
  }

  onAutocompleteClosed() {
    console.log('Autocomplete cerrado');
  }
  public initForm(): void {
    this.searcherForm = this.fb.group({
      search: [null],
      attribute: [null],
      workflow: [null]
    });
  }

  public cardSelected(card: WorkflowCardDTO): void {
    this.searcherForm.get('search').setValue(null);
    this.cards = [];
  }

  public getDateToShow(card: WorkflowCardDTO) {
    if (card.cardInstanceWorkflows[0]?.dateAppliTimeLimit) {
      return card.cardInstanceWorkflows[0]?.dateAppliTimeLimit;
    }
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

  public showWorkflowSubstate(index: number): boolean {
    if (this.cards?.length && index > 0) {
      const prevCard = this.cards[index - 1];
      const actualCard = this.cards[index];
      if (
        prevCard.cardInstanceWorkflows[0].workflowId === actualCard.cardInstanceWorkflows[0].workflowId &&
        prevCard.cardInstanceWorkflows[0].workflowSubstateName === actualCard.cardInstanceWorkflows[0].workflowSubstateName
      ) {
        return false;
      }
    }
    return true;
  }

  public onScroll(): void {
    if (!this.paginationConfig.last && this.paginationConfig.page < this.paginationConfig.totalPages) {
      this.searching++;
      this.paginationConfig.page++;
      this.fetchData();
    }
  }

  private filter(value?: string) {
    value = value ? value : this.searcherForm.get('search')?.value;
    this.filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    if (this.lastSearch.length === 0) {
      this.searching++;
      this.paginationConfig.page = 0;
      this.fetchData();
    }
    this.lastSearch.push(value);
  }

  private fetchData() {
    this.workflowService
      .searchCardsInWorkflowsPaged(this.filterValue, this.paginationConfig)
      .pipe(
        take(1),
        finalize(() => {
          this.searching--;
          if (this.lastSearch.length >= 1) {
            this.searching++;
            this.paginationConfig.page = 0;
            this.fetchData();
          }
          this.lastSearch = [];
        })
      )
      .subscribe((data: PaginationResponseI<WorkflowCardDTO>) => {
        if (data) {
          this.paginationConfig.length = data.totalElements;
          this.paginationConfig.first = data.first;
          this.paginationConfig.last = data.last;
          this.paginationConfig.page = data.number;
          this.paginationConfig.totalPages = data.totalPages;
          this.paginationConfig.first = data.first;
          if (data.first) {
            this.cards = [];
          }
          this.cards = [...this.cards, ...data.content];
        } else {
          this.cards = [];
        }
      });
  }
}

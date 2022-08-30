import { Injectable } from '@angular/core';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDragAndDropService {
  public draggingCard$: BehaviorSubject<WorkflowCardDTO> = new BehaviorSubject(null);
  public droppableStates$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public expandedColumns$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  constructor() {}

  public resetObservables(): void {
    this.draggingCard$.next(null);
    this.droppableStates$.next([]);
    this.expandedColumns$.next([]);
  }

  public isDroppableState(state: string): boolean {
    return this.droppableStates$.value.indexOf(state) >= 0;
  }

  public removeExpandedColumn(id: string): void {
    const expandedColumns = this.expandedColumns$.value;
    if (expandedColumns.indexOf(id) >= 0) {
      expandedColumns.splice(expandedColumns.indexOf(id), 1);
      this.expandedColumns$.next(expandedColumns);
    }
  }

  public addExpandedColumn(id: string): void {
    const expandedColumns = this.expandedColumns$.value;
    if (expandedColumns.indexOf(id) === -1) {
      expandedColumns.push(id);
      this.expandedColumns$.next(expandedColumns);
    }
  }

  public isColumnExpanded(id: string): boolean {
    return this.expandedColumns$.value.indexOf(id) >= 0;
  }
}

import { Injectable } from '@angular/core';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDragAndDropService {
  public draggingCard$: BehaviorSubject<WorkflowCardDTO> = new BehaviorSubject(null);
  public droppableStates$: BehaviorSubject<string[]> = new BehaviorSubject(null);
  public expandedColumns$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  private readonly DRAG_AND_DROP_ENABLED = false;

  constructor() {}

  public resetObservables(): void {
    this.draggingCard$.next(null);
    this.droppableStates$.next(null);
    this.expandedColumns$.next([]);
  }

  public isDragAndDropEnabled(): boolean {
    return this.DRAG_AND_DROP_ENABLED;
  }

  public isDroppableState(state: string): boolean {
    if (!this.DRAG_AND_DROP_ENABLED) {
      return false;
    }
    return this.droppableStates$.value?.indexOf(state) >= 0;
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

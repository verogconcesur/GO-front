import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class WorkflowDragAndDropService {
  public draggingCard$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}
}

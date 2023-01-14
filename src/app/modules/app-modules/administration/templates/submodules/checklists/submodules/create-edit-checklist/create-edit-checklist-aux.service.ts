import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CreateEditChecklistAuxService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public checklist$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {}
}

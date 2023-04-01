import { Injectable } from '@angular/core';
import WorkflowSocketCardDetailDTO from '@data/models/workflows/workflow-sockect-card-detail-dto';
import { RxStomp } from '@stomp/rx-stomp';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RxStompService extends RxStomp {
  //Used for WebSockets: card detail changes (DETAIL_COMMENTS,DETAIL_MESSAGES,DETAIL_FULL)
  public cardDeatilWs$: BehaviorSubject<WorkflowSocketCardDetailDTO> = new BehaviorSubject(null);

  constructor() {
    super();
  }
}

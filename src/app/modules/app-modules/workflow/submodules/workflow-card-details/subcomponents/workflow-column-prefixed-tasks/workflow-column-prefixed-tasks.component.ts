import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardTasksService } from '@data/services/card-tasks.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-prefixed-tasks',
  templateUrl: './workflow-column-prefixed-tasks.component.html',
  styleUrls: ['./workflow-column-prefixed-tasks.component.scss']
})
export class WorkflowColumnPrefixedTasksComponent implements OnInit, AfterViewInit {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public cardId: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cardId = parseInt(this.route?.snapshot?.params?.idCard, 10);
    });
  }
}

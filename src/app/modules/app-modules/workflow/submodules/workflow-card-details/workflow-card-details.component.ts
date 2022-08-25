/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ResponsiveTabI } from '@shared/components/responsive-tabs/responsive-tabs.component';
import { CardService } from '@data/services/cards.service';
import { take } from 'rxjs/operators';
import CardDto from '@data/models/cards/card-dto';
import CardColumnDto from '@data/models/cards/card-column-dto';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ConcenetError } from '@app/types/error';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workflow-card-details',
  templateUrl: './workflow-card-details.component.html',
  styleUrls: ['./workflow-card-details.component.scss']
})
export class WorkflowCardDetailsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public relativeTo: any = null;
  public card: WorkflowCardDto = null;
  public idCard: number = null;
  public tabSelected: 'column1' | 'column2' | 'messages' | 'actions' = 'column1';
  public showMode: 'all' | 'semi' | 'individual' = 'all';
  public labels = {
    column1: '',
    column2: '',
    messages: marker('common.messages'),
    actions: marker('common.actions')
  };
  public columnsConfig: CardColumnDto[] = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cardService: CardService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
  ) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.setShowMode(event.target.innerWidth);
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (state.card) {
      this.card = JSON.parse(state.card);
      this.idCard = this.card.cardId;
    } else if (this.route?.snapshot?.params?.id) {
      this.idCard = parseInt(this.route?.snapshot?.params?.id, 10);
    }
    this.setShowMode(window.innerWidth);
    this.getCardInfo();
  }

  public setShowMode(width: number) {
    let showMode: 'all' | 'semi' | 'individual' = 'all';
    if (width <= 1400 && width > 1150) {
      showMode = 'semi';
    } else if (width <= 1150) {
      showMode = 'individual';
    }
    this.showMode = showMode;
  }

  public close(): void {
    if (this.relativeTo) {
      this.router.navigate([{ outlets: { card: null } }], {
        relativeTo: this.relativeTo
      });
    } else {
      const currentUrl = window.location.hash.split('#/').join('/').split('/(card:')[0];
      this.router.navigateByUrl(currentUrl);
    }
  }

  public isTabSelected(tab: 'column1' | 'column2' | 'messages' | 'actions'): boolean {
    return this.tabSelected === tab;
  }

  public changeSelectedTab(tab: 'column1' | 'column2' | 'messages' | 'actions'): void {
    this.tabSelected = tab;
  }

  public getContainerClass(): string {
    return this.showMode + ' ' + this.tabSelected;
  }

  private getCardInfo(): void {
    console.log(
      // eslint-disable-next-line max-len
      'TODO DGDC: invocar servicio para obtener los datos de la cabecera de la tarjeta y la estructura de columnas y pestañas, quitar hardcode'
    );
    const spinner = this.spinnerService.show();
    this.cardService
      .getCardById(this.card?.cardId ? this.card.cardId : 2)
      .pipe(take(1))
      .subscribe(
        (data: CardDto) => {
          console.log(data);
          this.spinnerService.hide(spinner);
          this.columnsConfig = data.cols;
        },
        (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.close();
        }
      );
  }
}

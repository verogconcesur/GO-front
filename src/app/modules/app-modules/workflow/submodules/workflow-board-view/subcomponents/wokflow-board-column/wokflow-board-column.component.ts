import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDTO from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { WorkflowDragAndDropService } from '@modules/app-modules/workflow/aux-service/workflow-drag-and-drop.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, finalize, take } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-wokflow-board-column',
  templateUrl: './wokflow-board-column.component.html',
  styleUrls: ['./wokflow-board-column.component.scss']
})
export class WokflowBoardColumnComponent implements OnInit {
  @Input() workflow: WorkflowDTO = null;
  @Input() wState: WorkflowStateDTO = null;
  @Input() divider = true;
  public collapsed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public hideEmptyDropZone: any = {};
  public cardDragging: WorkflowCardDTO = null;
  public droppableStates: string[] = null;
  public changeCollapseStatusOnOver = false;
  //  DGDC: quitar en el momento en el que se pueda ordenar dentro de un mismo subestado
  public originCardDropZone: string = null;
  public readonly wStateKey = 'wState-';
  public readonly wCollapsedStateKey = 'wCollapsedState-';
  public readonly wSubstateKey = 'wSubstate-';
  public readonly droppableZoneClass = 'droppable-zone';
  public readonly undroppableZoneClass = 'undroppable';
  public readonly timeToWaitBeforeExpandColumnOnDragging = 1500;
  public isDragAndDropEnabled: boolean;

  public labels = {
    seeMore: marker('common.seeMore'),
    seeCards: marker('common.seeCards'),
    seeLess: marker('common.seeLess'),
    workers: marker('workflows.peopleWorking'),
    nCards: marker('workflows.numCards'),
    emptySubstate: marker('workflows.emptySubstate'),
    dropHere: marker('common.dropHere'),
    originSubstate: marker('workflows.originalSubstate')
  };

  constructor(
    public workflowService: WorkflowsService,
    private authService: AuthenticationService,
    private dragAndDropService: WorkflowDragAndDropService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.isDragAndDropEnabled = this.dragAndDropService.isDragAndDropEnabled();
    this.collapsed = this.wState.front;
    const id = `${this.wStateKey}${this.wState.id}`;
    if (this.dragAndDropService.isColumnExpanded(id)) {
      this.collapsed = false;
    }
    this.initListeners();
  }

  public initListeners(): void {
    if (this.isDragAndDropEnabled) {
      this.dragAndDropService.draggingCard$.pipe(untilDestroyed(this)).subscribe((dragging: WorkflowCardDTO) => {
        this.cardDragging = dragging;
      });
      this.dragAndDropService.droppableStates$.pipe(untilDestroyed(this)).subscribe((droppableStates: string[]) => {
        this.droppableStates = droppableStates;
      });
    }
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
    const id = `${this.wStateKey}${this.wState.id}`;
    if (this.collapsed) {
      this.dragAndDropService.removeExpandedColumn(id);
    } else {
      this.dragAndDropService.addExpandedColumn(id);
    }
  }

  public isStateEmpty(): boolean {
    let isEmpty = true;
    this.wState.workflowSubstates.forEach((wss: WorkflowSubstateDTO) => {
      if (wss.cards.length) {
        isEmpty = false;
      }
    });
    return isEmpty;
  }

  public setHideEmptyDropZone(id: string, value: boolean) {
    if ((this.isDragAndDropEnabled && this.droppableStates?.indexOf(id) >= 0) || this.droppableStates?.length === 0) {
      this.hideEmptyDropZone[id] = value;
    }
  }

  public getHideEmptyDropZone(id: string): boolean {
    return this.hideEmptyDropZone[id];
  }

  public showDropCover(id: string): boolean {
    if (
      this.isDragAndDropEnabled &&
      this.cardDragging &&
      (this.droppableStates?.indexOf(id) >= 0 || this.droppableStates?.length === 0) &&
      // DGDC: descomentar en el momento en el que se pueda ordenar dentro de un mismo subestado
      // id.indexOf(`${this.wSubstateKey}${this.cardDragging.cardInstanceWorkflows[0].workflowSubstateId}`) === -1 &&
      this.hideEmptyDropZone[id]
    ) {
      return true;
    }
    return false;
  }

  //  DGDC: quitar en el momento en el que se pueda ordenar dentro de un mismo subestado
  public setOriginDropZone(id: string, show: boolean): void {
    if (this.isDragAndDropEnabled) {
      return;
    }
    if (show) {
      this.originCardDropZone = id;
    } else {
      this.originCardDropZone = null;
    }
  }
  //  DGDC: quitar en el momento en el que se pueda ordenar dentro de un mismo subestado
  public showOriginSubstateZone(id: string): boolean {
    if (this.isDragAndDropEnabled) {
      return false;
    }
    if (this.originCardDropZone === id) {
      return true;
    }
    return false;
  }

  public getUserName(wUser: WorkflowSubstateUserDTO): string {
    if (wUser.user.fullName) {
      return wUser.user.fullName;
    } else {
      let fullName = '';
      if (wUser.user.name) {
        fullName = `${wUser.user.name} `;
      }
      if (wUser.user.firstName) {
        fullName = `${wUser.user.firstName} `;
      }
      if (wUser.user.lastName) {
        fullName = `${wUser.user.lastName} `;
      }
      return fullName;
    }
  }

  public getCardsFilteredByUser(user: WorkflowSubstateUserDTO, cards: WorkflowCardDTO[]): WorkflowCardDTO[] {
    return cards.filter(
      (card: WorkflowCardDTO) => card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id
    );
  }

  public getWSubstatesToShowByUser(user: WorkflowSubstateUserDTO, wState: WorkflowStateDTO): WorkflowSubstateDTO[] {
    return wState.workflowSubstates.filter((wss: WorkflowSubstateDTO) => user.cardsBySubstateId[wss.id]);
  }

  public getAssociatedWSubstates(card: WorkflowCardDTO, itSelf?: string): string[] {
    let associatedWSubstates: string[] = null;
    // Habilitamos sólo los movimientos para reordenar dentro de un subestado
    if (itSelf && this.authService.hasUserAnyPermission(['REORDFICH'])) {
      associatedWSubstates = [];
      associatedWSubstates.push(itSelf);
    }
    // if (card?.movements?.length) {
    //   associatedWSubstates = [];
    //   card.movements.forEach((move: WorkflowMoveDTO) => {
    //     if (move.workflowSubstateTarget.workflowState?.front) {
    //       move.workflowSubstateTarget.workflowSubstateUser.forEach((wUser: WorkflowSubstateUserDTO) => {
    //         const idState = this.wCollapsedStateKey + move.workflowSubstateTarget.workflowState.id;
    //         const id = this.wSubstateKey + move.workflowSubstateTarget.id + '-' + wUser.user.id;
    //         if (associatedWSubstates.indexOf(idState) === -1) {
    //           associatedWSubstates.push(idState);
    //         }
    //         if (associatedWSubstates.indexOf(id) === -1) {
    //           associatedWSubstates.push(id);
    //         }
    //       });
    //     } else {
    //       const id = this.wSubstateKey + move.workflowSubstateTarget.id;
    //       if (associatedWSubstates.indexOf(id) === -1) {
    //         associatedWSubstates.push(id);
    //       }
    //       // DGDC: descomentar en el momento en el que se pueda ordenar dentro de un mismo subestado
    //       // if (itSelf) {
    //       //   associatedWSubstates.push(itSelf);
    //       // }
    //     }

    //     //Ya no es necesario ya que back me devuelve estos movimientos (movimientos dentro del mismo subestado pero dif user)
    //     // if (itSelf && move.workflowSubstateSource.workflowState.front) {
    //     //   move.workflowSubstateSource.workflowSubstateUser.forEach((wUser: WorkflowSubstateUserDTO) => {
    //     //     const id = this.wSubstateKey + move.workflowSubstateSource.id + '-' + wUser.user.id;
    //     //     if (associatedWSubstates.indexOf(id) === -1 && id !== itSelf) {
    //     //       associatedWSubstates.push(id);
    //     //     }
    //     //   });
    //     // }
    //   });
    // } else if (card?.movements && card.movements.length === 0) {
    //   associatedWSubstates = [];
    // }
    return associatedWSubstates;
  }

  public getCollapsedDropZoneClass(): string {
    let classes = '';
    //Si recibo un array vacío en droppable states es porque se permiten todos los movimientos
    if (this.droppableStates?.length === 0) {
      classes += `${this.droppableZoneClass} `;
    } else {
      this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDTO) => {
        const sClass = `${this.wSubstateKey}${wSubstate.id}`;
        if (
          this.cardDragging &&
          classes.indexOf(this.droppableZoneClass) === -1 &&
          this.droppableStates?.filter((id: string) => id.indexOf(sClass) === 0).length
        ) {
          classes += `${this.droppableZoneClass} `;
        }
      });
    }
    if (classes.indexOf(this.droppableZoneClass) === -1) {
      classes += `${this.undroppableZoneClass} `;
    }
    return classes;
  }

  public getCollapsedWDroppedClasses(): string {
    let classes = '';
    this.wState.workflowSubstates.forEach((wSubstate: WorkflowSubstateDTO) => {
      classes += `${this.wSubstateKey}${wSubstate.id} `;
    });
    return classes;
  }

  public getCardWrapperClasses(id: string): string {
    let classes = '';
    if (this.cardDragging) {
      // console.log(id, this.droppableStates);
      if (this.droppableStates?.indexOf(id) >= 0 || this.droppableStates?.length === 0) {
        classes += this.droppableZoneClass;
      } else {
        classes += this.undroppableZoneClass;
      }
    }
    return classes;
  }

  public mouseOverCollapsedCard(event: MouseEvent, action: 'over' | 'leave') {
    if (this.isDragAndDropEnabled) {
      return;
    }
    if (this.getCollapsedDropZoneClass().indexOf(this.droppableZoneClass) >= 0 && action === 'over') {
      this.changeCollapseStatusOnOver = true;
      setTimeout(() => {
        if (this.changeCollapseStatusOnOver && this.collapsed) {
          const id = `${this.wStateKey}${this.wState.id}`;
          this.collapsed = false;
          this.dragAndDropService.addExpandedColumn(id);
        }
      }, this.timeToWaitBeforeExpandColumnOnDragging);
    } else {
      this.changeCollapseStatusOnOver = false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<any[]>, wSubState: WorkflowSubstateDTO, user: WorkflowSubstateUserDTO, dropZoneId: string) {
    if (!this.isDragAndDropEnabled) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item: any = event.previousContainer.data[event.previousIndex];
    // const request: Observable<WorkflowCardInstanceDTO> = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // let itemToReplace: any = null;
    // if (event.container.data[event.currentIndex]) {
    //   //Se va a reemplazar el orden de un elemento
    //   itemToReplace = event.container.data[event.currentIndex];
    // } else {
    //   //Se va a posicionar en la última posición
    //   itemToReplace = { orderNumber: null };
    // }
    const sameDropZone =
      // `${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}` === dropZoneId ||
      event.container.id === event.previousContainer.id;
    // Ordenar dentro de un mismo subestado
    if ((event.previousContainer === event.container && event.previousIndex !== event.currentIndex) || sameDropZone) {
      event.container.data.splice(event.previousIndex, 1);
      event.container.data.splice(event.currentIndex, 0, item);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event.container.data.map((d: any, index) => {
        d.orderNumber = index;
        d.cardInstanceWorkflows[0].orderNumber = index;
        return d;
      });
      const spinner = this.spinnerService.show();
      this.workflowService
        .reindexCards(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [...event.container.data].map((d: any) => d.cardInstanceWorkflows[0].id),
          event.container.data[0].cardInstanceWorkflows[0].workflowSubstateId
        )
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe({
          next: (d) => {},
          error: (e) => {
            console.log(e);
            this.prepareAndMoveService.reloadData$.next('MOVES_IN_THIS_WORKFLOW');
          }
        });
    }
    // else if (event.previousContainer !== event.container && !sameDropZone) {
    //   const move: WorkflowMoveDTO = item.movements.find(
    //     (wMove: WorkflowMoveDTO) => wMove.workflowSubstateTarget.id === wSubState.id
    //   );
    //   item.orderNumber =
    //     dropZoneId.indexOf(`${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}`) >= 0
    //       ? itemToReplace.orderNumber
    //       : null;
    //   // item.orderNumber = itemToReplace.orderNumber;
    //   if (move?.id) {
    //     this.prepareAndMoveService.prepareAndMove(item, move, user, dropZoneId, itemToReplace);
    //   }
    // }

    //DGDC: busco siempre el movimiento ya que por lo pronto no se invocará el servicio de ordenar.
    // const move: WorkflowMoveDTO = item.movements
    //   ? item.movements.find((wMove: WorkflowMoveDTO) => wMove.workflowSubstateTarget.id === wSubState.id)
    //   : null;
    // item.orderNumber =
    //   dropZoneId.indexOf(`${this.wSubstateKey}${item.cardInstanceWorkflows[0].workflowSubstateId}`) >= 0
    //     ? itemToReplace.orderNumber
    //     : null;
    // if (move?.id || move?.id === 0) {
    //   this.prepareAndMoveService.prepareAndMove(item, move, wSubState, user, dropZoneId, itemToReplace);
    // } else if (item.workflowSubstate && wSubState) {
    //   this.prepareAndMoveService.prepareAndMove(item, move, wSubState, user, dropZoneId, itemToReplace);
    // }

    // if (request) {
    //   const spinner = this.spinnerService.show();
    //   request.pipe(take(1)).subscribe(
    //     (data) => {
    //       this.spinnerService.hide(spinner);
    //       this.prepareAndMoveService.reloadData$.next('MOVES_IN_THIS_WORKFLOW');
    //     },
    //     (error) => {
    //       this.logger.error(error);
    //       this.globalMessageService.showError({
    //         message: error.message,
    //         actionText: this.translateService.instant(marker('common.close'))
    //       });
    //       this.spinnerService.hide(spinner);
    //       this.prepareAndMoveService.reloadData$.next('MOVES_IN_THIS_WORKFLOW');
    //     }
    //   );
    // }
  }
}

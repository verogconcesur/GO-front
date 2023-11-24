import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { TasksModalComponent } from '@modules/feature-modules/workflow-card-tasks/tasks-modal/tasks-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { replacerFunc } from '@shared/utils/replacer-function';

@Component({
  selector: 'app-workflow-table-substate',
  templateUrl: './workflow-table-substate.component.html',
  styleUrls: ['./workflow-table-substate.component.scss']
})
export class WorkflowTableSubstateComponent implements OnInit {
  @Input() workflow: WorkflowDTO = null;
  @Input() wState: WorkflowStateDTO = null;
  @Input() wSubstate: WorkflowSubstateDTO = null;
  public labels = {
    employee: marker('common.employee'),
    noCards: marker('errors.noCardsToShow'),
    noFields: marker('errors.noFieldsDefined'),
    actions: marker('common.actions'),
    information: marker('common.information')
  };
  public dataSource: WorkflowDTO[] = [];
  public displayedColumns: string[];
  public headers: { col: string; label: string }[] = [];
  public showData = false;

  constructor(
    private translateService: TranslateService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  public initializeTableData(): void {
    if (
      this.wSubstate.cards &&
      this.wSubstate.cards.length &&
      this.wSubstate.cards[0].tabItems &&
      this.wSubstate.cards[0].tabItems.length
    ) {
      this.displayedColumns = [];
      if (this.wState.front) {
        this.displayedColumns.push('employee');
        this.headers.push({ col: 'employee', label: this.translateService.instant(this.labels.employee) });
      }
      this.wSubstate.cards[0].tabItems.forEach((tabItem: WorkflowCardTabItemDTO) => {
        switch (tabItem.typeItem) {
          case 'ACTION':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'INPUT':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'LINK':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'LIST':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'OPTION':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'TEXT':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'TITLE':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({ col: tabItem.id + tabItem.name, label: tabItem.name });
            break;
          case 'VARIABLE':
            this.displayedColumns.push(tabItem.id + tabItem.name);
            this.headers.push({
              col: tabItem.id + tabItem.name,
              label: tabItem.tabItemConfigVariable.variable.contentSource.name + ': ' + tabItem.name
            });
            break;
        }
      });
      this.displayedColumns.push('information');
      this.headers.push({ col: 'information', label: this.translateService.instant(this.labels.information) });
      this.displayedColumns.push('tasks');
      this.headers.push({ col: 'tasks', label: this.translateService.instant(this.labels.actions) });
      this.showData = true;
    }
  }
  public getValue(card: WorkflowCardDTO, index: number): string {
    const tabItem: WorkflowCardTabItemDTO = card.tabItems[index];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let slot: any = null;
    if (tabItem) {
      switch (tabItem.typeItem) {
        case 'ACTION':
          slot = tabItem.tabItemConfigAction;
          break;
        case 'INPUT':
          slot = tabItem.tabItemConfigInput.cardTabItemInstance;
          break;
        case 'LINK':
          slot = tabItem.tabItemConfigLink;
          break;
        case 'LIST':
          let found = null;
          if (tabItem.tabItemConfigList?.listItems?.length && tabItem.tabItemConfigList?.cardTabItemInstance?.value) {
            found = tabItem.tabItemConfigList.listItems.find(
              (item) => item.code === tabItem.tabItemConfigList.cardTabItemInstance.value
            );
          }
          if (found) {
            slot = found;
          } else {
            slot = tabItem.tabItemConfigList.cardTabItemInstance;
          }
          break;
          break;
        case 'OPTION':
          slot = tabItem.tabItemConfigOption.variable;
          break;
        case 'TEXT':
          slot = tabItem.tabItemConfigText.variable;
          break;
        case 'TITLE':
          slot = tabItem.tabItemConfigTitle.variable;
          break;
        case 'VARIABLE':
          slot = tabItem.tabItemConfigVariable.variable;
          break;
      }
      if (slot?.value) {
        const datePipe = new DatePipe('en-EN');
        const dataType = slot?.dataType ? slot.dataType : '';
        const attrname = slot?.attributeName ? slot.attributeName : '';
        if (attrname === 'dueOutDateTime') {
          return this.translateService.instant('workflows.dueOutDateTime', {
            date: datePipe.transform(slot.value, 'dd/MM'),
            time: datePipe.transform(slot.value, 'HH:mm')
          });
        }
        switch (dataType) {
          case 'DATE':
            return datePipe.transform(slot.value, 'dd/MM/YYYY');
          case 'DATETIME':
            return datePipe.transform(slot.value, 'dd/MM/YYYY, HH:mm');
          default:
            return slot?.value ? slot.value : '';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
  public getUserName(card: WorkflowCardDTO): string {
    const userDetail = this.wSubstate.workflowSubstateUser.find((user: WorkflowSubstateUserDTO) => {
      if (card.cardInstanceWorkflows?.length >= 1 && card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers?.length >= 1) {
        return card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].userId === user.user.id;
      }
      return false;
    });
    if (!userDetail) {
      return '';
    }
    if (userDetail.user.fullName) {
      return userDetail.user.fullName;
    } else {
      let fullName = '';
      if (userDetail.user.name) {
        fullName = `${userDetail.user.name} `;
      }
      if (userDetail.user.firstName) {
        fullName = `${userDetail.user.firstName} `;
      }
      if (userDetail.user.lastName) {
        fullName = `${userDetail.user.lastName} `;
      }
      return fullName;
    }
  }
  public getColors(card: WorkflowCardDTO): string[] {
    return card?.colors?.length ? card.colors : [];
  }

  public getColorsClass(card: WorkflowCardDTO): string {
    return `x-${this.getColors(card).length}`;
  }

  public showTasks(card: WorkflowCardDTO): void {
    this.dialog.open(TasksModalComponent, { data: { cardId: card.cardInstanceWorkflows[0].id } });
  }
  public getErrorMsg(): string {
    let message = '';
    if (this.wSubstate.cards && this.wSubstate.cards.length) {
      message = this.translateService.instant(this.labels.noFields);
    } else {
      message = this.translateService.instant(this.labels.noCards);
    }
    return message;
  }
  public extraInfoValue(card: WorkflowCardDTO): string {
    let extraInfo = '';
    if (card.information) {
      extraInfo = card.information;
    }
    if (card.cardInstanceWorkflows && card.cardInstanceWorkflows.length && card.cardInstanceWorkflows[0].information) {
      extraInfo = card.cardInstanceWorkflows[0].information;
    }
    return extraInfo;
  }
  public extendExtraInfoValue(card: WorkflowCardDTO) {
    card.expandInfo = !card.expandInfo;
  }
  public goDetailCard(card: WorkflowCardDTO): void {
    this.router.navigate(
      [
        {
          outlets: {
            card: [
              RouteConstants.WORKFLOWS_ID_CARD,
              card.cardInstanceWorkflows[0].id,
              RouteConstants.WORKFLOWS_ID_USER,
              this.wState.front &&
              card.cardInstanceWorkflows?.length >= 1 &&
              card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers?.length >= 1
                ? card.cardInstanceWorkflows[0].cardInstanceWorkflowUsers[0].id
                : null
            ]
          }
        }
      ],
      {
        relativeTo: this.route,
        state: {
          relativeTo: JSON.stringify(this.route, replacerFunc),
          card: JSON.stringify(card)
        }
      }
    );
  }
  ngOnInit(): void {
    this.initializeTableData();
  }
}

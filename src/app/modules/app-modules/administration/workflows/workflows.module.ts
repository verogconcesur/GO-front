/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
import { SharedModule } from '@shared/shared.module';
import { WorkflowsRoutingModule } from './workflows-routing.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { WorkflowsFilterComponent } from './components/workflows-filter/workflows-filter.component';
import { WorkflowsTableComponent } from './components/workflows-table/workflows-table.component';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { CreateEditWorkflowComponent } from './components/modals/create-edit-workflow/create-edit-workflow.component';
// eslint-disable-next-line max-len
import { WorkflowBudgetsComponent } from './components/create-edit-steps/workflow-budgets/workflow-budgets.component';
import { WorkflowCardConfigComponent } from './components/create-edit-steps/workflow-card-config/workflow-card-config.component';
import { WorkflowCardsComponent } from './components/create-edit-steps/workflow-cards/workflow-cards.component';
import { WorkflowOrganizationComponent } from './components/create-edit-steps/workflow-organization/workflow-organization.component';
import { WorkflowRolesComponent } from './components/create-edit-steps/workflow-roles/workflow-roles.component';
import { WorkflowStatesComponent } from './components/create-edit-steps/workflow-states/workflow-states.component';
import { WorkflowTimelineComponent } from './components/create-edit-steps/workflow-timeline/workflow-timeline.component';
import { WorkflowUsersComponent } from './components/create-edit-steps/workflow-users/workflow-users.component';
// eslint-disable-next-line max-len
import { GenericTreeNodeSearcherModule } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.module';
import { MatChipsInputFormFieldModule } from '@modules/feature-modules/mat-chips-input-form-field/mat-chips-input-form-field.module';
import { UserSearcherDialogModule } from '@modules/feature-modules/user-searcher-dialog/user-searcher-dialog.module';
import { WorkflowCardModule } from '../../../feature-modules/workflow-card/workflow-card.module';
import { WorkflowsCreateEditAuxService } from './aux-service/workflows-create-edit-aux.service';
import { WorkflowCalendarComponent } from './components/create-edit-steps/workflow-calendar/workflow-calendar.component';
import { WorkflowCardsPermissionsComponent } from './components/create-edit-steps/workflow-cards/modals/workflow-cards-permissions/workflow-cards-permissions.component';
import { WfEditStateDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-state-dialog/wf-edit-state-dialog.component';
import { WfEditPermissionsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-permissions-tab/wf-edit-permissions-tab.component';
import { WfEditSubstateEventsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-events-tab/wf-edit-substate-events-tab.component';
import { WfEditSubstateGeneralTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-general-tab/wf-edit-substate-general-tab.component';
import { WfEditSubstateMovementsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-movements-tab/wf-edit-substate-movements-tab.component';
import { WfEditSubstateDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/wf-edit-substate-dialog.component';
import { WfEditSubstateEventsDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-events-dialog/wf-edit-substate-events-dialog.component';

@NgModule({
  declarations: [
    WorkflowDetailComponent,
    WorkflowListComponent,
    WorkflowsTableComponent,
    WorkflowsFilterComponent,
    CreateEditWorkflowComponent,
    WorkflowOrganizationComponent,
    WorkflowRolesComponent,
    WorkflowUsersComponent,
    WorkflowCardsComponent,
    WorkflowCardConfigComponent,
    WorkflowTimelineComponent,
    WorkflowStatesComponent,
    WorkflowBudgetsComponent,
    WorkflowCardsPermissionsComponent,
    WfEditSubstateDialogComponent,
    WfEditStateDialogComponent,
    WfEditSubstateGeneralTabComponent,
    WfEditSubstateMovementsTabComponent,
    WfEditSubstateEventsTabComponent,
    WfEditPermissionsTabComponent,
    WfEditSubstateEventsDialogComponent,
    WorkflowCalendarComponent
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule,
    UserSearcherDialogModule,
    GenericTreeNodeSearcherModule,
    MatChipsInputFormFieldModule,
    WorkflowCardModule
  ],
  providers: [WorkflowsCreateEditAuxService]
})
export class WorkflowsModule {}

/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { SharedModule } from '@shared/shared.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { WorkflowDetailComponent } from './components/workflow-detail/workflow-detail.component';
import { WorkflowListComponent } from './components/workflow-list/workflow-list.component';
import { WorkflowsTableComponent } from './components/workflows-table/workflows-table.component';
import { WorkflowsFilterComponent } from './components/workflows-filter/workflows-filter.component';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { CreateEditWorkflowComponent } from './components/modals/create-edit-workflow/create-edit-workflow.component';
// eslint-disable-next-line max-len
import { WorkflowOrganizationComponent } from './components/create-edit-steps/workflow-organization/workflow-organization.component';
import { WorkflowRolesComponent } from './components/create-edit-steps/workflow-roles/workflow-roles.component';
import { WorkflowUsersComponent } from './components/create-edit-steps/workflow-users/workflow-users.component';
import { WorkflowCardsComponent } from './components/create-edit-steps/workflow-cards/workflow-cards.component';
import { WorkflowCardConfigComponent } from './components/create-edit-steps/workflow-card-config/workflow-card-config.component';
import { WorkflowTimelineComponent } from './components/create-edit-steps/workflow-timeline/workflow-timeline.component';
import { WorkflowStatesComponent } from './components/create-edit-steps/workflow-states/workflow-states.component';
import { WorkflowBudgetsComponent } from './components/create-edit-steps/workflow-budgets/workflow-budgets.component';
// eslint-disable-next-line max-len
import { WorkflowCardsPermissionsComponent } from './components/create-edit-steps/workflow-cards/modals/workflow-cards-permissions/workflow-cards-permissions.component';
import { UserSearcherDialogModule } from '@modules/feature-modules/user-searcher-dialog/user-searcher-dialog.module';
import { WfEditSubstateDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/wf-edit-substate-dialog.component';
import { WfEditStateDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-state-dialog/wf-edit-state-dialog.component';
import { WfEditSubstateGeneralTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-general-tab/wf-edit-substate-general-tab.component';
import { WfEditSubstateMovementsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-movements-tab/wf-edit-substate-movements-tab.component';
import { WfEditSubstateEventsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-substate-events-tab/wf-edit-substate-events-tab.component';
import { WfEditPermissionsTabComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-dialog/tabs/wf-edit-permissions-tab/wf-edit-permissions-tab.component';
import { GenericTreeNodeSearcherModule } from '@modules/feature-modules/generic-tree-node-searcher/generic-tree-node-searcher.module';
import { WfEditSubstateEventsDialogComponent } from './components/create-edit-steps/workflow-states/modals/wf-edit-substate-events-dialog/wf-edit-substate-events-dialog.component';
import { WorkflowsCreateEditAuxService } from './aux-service/workflows-create-edit-aux.service';

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
    WfEditSubstateEventsDialogComponent
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule,
    UserSearcherDialogModule,
    GenericTreeNodeSearcherModule
  ],
  providers: [WorkflowsCreateEditAuxService]
})
export class WorkflowsModule {}

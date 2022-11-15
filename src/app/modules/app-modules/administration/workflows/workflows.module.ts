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
import { UserSearcherDialogModule } from '@modules/feature-modules/user-searcher-dialog/user-searcher-dialog.module';

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
    WorkflowBudgetsComponent
  ],
  imports: [
    CommonModule,
    WorkflowsRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    OrganizationLevelsNestedCombosModule,
    UserSearcherDialogModule
  ]
})
export class WorkflowsModule {}

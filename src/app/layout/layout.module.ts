import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
import { MyProfileDialogModule } from '@modules/feature-modules/my-profile-dialog/my-profile-dialog.module';
import { NewCardModule } from '@modules/feature-modules/new-card/new-card.module';
import { SharedModule } from '@shared/shared.module';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { NavbarComponent } from './dashboard-layout/components/navbar/navbar.component';
import { UserProfileComponent } from './dashboard-layout/components/user-profile/user-profile.component';
// eslint-disable-next-line max-len
import { WorkflowCardSearcherComponent } from './dashboard-layout/components/workflow-card-searcher/workflow-card-searcher.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [
    DashboardLayoutComponent,
    NavbarComponent,
    UserProfileComponent,
    AdministrationLayoutComponent,
    WorkflowCardSearcherComponent
  ],
  imports: [RouterModule, SharedModule, FilterDrawerModule, MyProfileDialogModule, NewCardModule],
  exports: [DashboardLayoutComponent],
  providers: []
})
export class LayoutModule {}

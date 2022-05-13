import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { NavbarComponent } from './dashboard-layout/components/navbar/navbar.component';
import { UserProfileComponent } from './dashboard-layout/components/user-profile/user-profile.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

@NgModule({
  declarations: [DashboardLayoutComponent, NavbarComponent, UserProfileComponent],
  imports: [RouterModule, SharedModule],
  exports: [DashboardLayoutComponent],
  providers: []
})
export class LayoutModule {}

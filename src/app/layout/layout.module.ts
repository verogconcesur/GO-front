import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { NavbarComponent } from './dashboard-layout/components/navbar/navbar.component';

@NgModule({
  declarations: [DashboardLayoutComponent, NavbarComponent],
  imports: [RouterModule, SharedModule],
  exports: [DashboardLayoutComponent],
  providers: []
})
export class LayoutModule {}

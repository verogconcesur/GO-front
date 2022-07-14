import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants, RoutePermissionConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { TemplatesComponent } from './templates.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    component: TemplatesComponent,
    canActivate: [AuthGuardService],
    data: { permissions: RoutePermissionConstants.ADMINISTRATION },
    children: [
      {
        path: RouteConstants.COMMUNICATIONS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./submodules/communication/communication.module').then((m) => m.CommunicationModule)
      },
      {
        path: RouteConstants.BUDGETS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./submodules/budgets/budgets.module').then((m) => m.BudgetsModule)
      },
      {
        path: RouteConstants.CHECKLISTS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./submodules/checklists/checklists.module').then((m) => m.ChecklistsModule)
      },
      {
        path: RouteConstants.ATTACHMENTS,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./submodules/attachments/attachments.module').then((m) => m.AttachmentsModule)
      },
      {
        path: RouteConstants.CLIENT_TIMELINE,
        canActivate: [AuthGuardService],
        loadChildren: () => import('./submodules/client-timeline/client-timeline.module').then((m) => m.ClientTimelineModule)
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.COMMUNICATIONS
      }
    ]
  },
  {
    path: RouteConstants.OTHER,
    pathMatch: 'full',
    redirectTo: RouteConstants.LOGIN
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule {}

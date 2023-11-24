/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthGuardService } from '@app/security/guards/authentication.guard';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';

const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    component: WorkflowCardDetailsComponent,
    children: [
      {
        path: `${RouteConstants.WORKFLOWS_ID_CARD}/${RouteConstants.ID_CARD}`,
        outlet: RouteConstants.WORKFLOWS_CARD_SIGN,
        loadChildren: () =>
          import('../../../../feature-modules/sign-card-documents-dialog/sign-card-documents-dialog.module').then(
            (m) => m.SignCardDocumentsDialogModule
          )
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowCardDetailsRoutingModule {}

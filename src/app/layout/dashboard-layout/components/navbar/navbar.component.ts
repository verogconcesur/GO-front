import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PermissionConstants } from '@app/constants/permission.constants';
import { RouteConstants } from '@app/constants/route.constants';
import FacilityDTO from '@data/models/organization/facility-dto';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { NewCardComponent, NewCardComponentModalEnum } from '@modules/feature-modules/new-card/new-card.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public readonly WORKFLOW_PATH = RouteConstants.WORKFLOWS;
  public labels = {
    title: marker('app.title'),
    workflow: marker('app.menu.workflow'),
    clients: marker('app.menu.clients'),
    vehicles: marker('app.menu.vehicles'),
    advanceSearch: marker('app.menu.advanceSearch'),
    administration: marker('app.menu.administration'),
    createCard: marker('app.menu.createCard'),
    search: marker('common.search')
  };
  public workflowSelected: WorkflowDTO = null;
  public facilitiesSelected: FacilityDTO[] = [];
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private workflowService: WorkflowsService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDTO) => {
      this.workflowSelected = workflow;
      if (workflow?.facilities?.length) {
        this.facilitiesSelected = workflow.facilities;
      }
    });
    this.workflowService.facilitiesSelectedSubject$.pipe(untilDestroyed(this)).subscribe((facilities: FacilityDTO[]) => {
      if (
        !this.workflowSelected?.facilities?.length ||
        (this.workflowSelected?.facilities?.length > 1 && facilities?.length === 1)
      ) {
        this.facilitiesSelected = facilities;
      }
    });
  }

  public navigateToAdministration(): void {
    this.router.navigate([RouteConstants.ADMINISTRATION]);
  }

  public isAdmin(): boolean {
    return this.authService.hasUserAnyPermission([PermissionConstants.ISADMIN]);
  }

  public openNewCardDialog(): void {
    this.dialog.open(NewCardComponent, {
      width: '80%',
      height: '80%',
      panelClass: NewCardComponentModalEnum.PANEL_CLASS,
      disableClose: true
    });
  }

  public syncData(): void {
    if (this.workflowSelected && this.facilitiesSelected?.length === 1) {
      this.workflowService
        .syncData(this.workflowSelected.id, this.facilitiesSelected[0].id)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.prepareAndMoveService.reloadData$.next('MOVES_IN_THIS_WORKFLOW');
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }
}

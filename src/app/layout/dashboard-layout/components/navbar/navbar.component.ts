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
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { take } from 'rxjs/operators';

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
  public searcherForm: UntypedFormGroup;
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private workflowService: WorkflowsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  public initForm(): void {
    this.searcherForm = this.fb.group({
      search: [null]
    });
  }

  public searchCards(): void {
    console.log(this.searcherForm, this.searcherForm.get('search')?.value);
    if (this.searcherForm.get('search')?.value?.length >= 3) {
      this.workflowService
        .searchCardsInWorkflows(this.searcherForm.get('search').value)
        .pipe(take(1))
        .subscribe((data: WorkflowCardDTO[]) => {
          console.log(data);
        });
    }
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
}

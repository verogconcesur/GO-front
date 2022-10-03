import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PermissionConstants } from '@app/constants/permission.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CustomDialogService } from '@jenga/custom-dialog';
import { NewCardComponent, NewCardComponentModalEnum } from '@modules/feature-modules/new-card/new-card.component';
import { take } from 'rxjs/operators';

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
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private customDialogService: CustomDialogService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

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
      panelClass: NewCardComponentModalEnum.PANEL_CLASS
    });
  }
}

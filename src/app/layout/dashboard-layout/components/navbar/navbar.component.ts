import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public labels = {
    title: marker('app.title'),
    logout: marker('logout.logout')
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
  }

  public doLogout(): void{
    this.authenticationService.logout();
    this.router.navigate([RouteConstants.LOGIN]);
  }

}

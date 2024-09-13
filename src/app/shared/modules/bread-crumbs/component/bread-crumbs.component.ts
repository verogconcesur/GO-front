import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BreadcrumbBackButtonConfigI } from '../interfaces/bread-crumbs-back-button-config.interface';
import { Breadcrumb } from '../models/bread-crumbs.model';
import { BreadCrumbsService } from '../services/bread-crumbs.service';

@Component({
  selector: 'jenga-bread-crumbs',
  templateUrl: './bread-crumbs.component.html',
  styleUrls: ['./bread-crumbs.component.scss'],
})
export class BreadCrumbsComponent {
  @Input() customClasses: string[] = [];
  @Input() backButtonConfig!: BreadcrumbBackButtonConfigI;

  breadcrumbs$: Observable<Breadcrumb[]>;
  private backUrl!: string;

  constructor(
    private readonly breadcrumbService: BreadCrumbsService,
    private router: Router
  ) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$.pipe(
      tap((data: Breadcrumb[]) => {
        if (data.length >= 2) {
          this.backUrl = data[data.length - 2].url;
        }
      })
    );
  }

  public goBack(): void {
    this.router.navigateByUrl(this.backUrl);
  }

  public showBackButton = (): boolean =>
    this.backButtonConfig?.hidden ? false : true;
  public getBackButtonColor = (): string =>
    this.backButtonConfig?.color ? this.backButtonConfig?.color : 'primary';

  public getBackButtonClass = (): string =>
    this.backButtonConfig?.class ? this.backButtonConfig?.class : '';

  public getBackButtonIconName = (): string =>
    this.backButtonConfig?.iconName
      ? this.backButtonConfig?.iconName
      : 'keyboard_arrow_left';

  public getBackButtonIconFontset = (): string =>
    this.backButtonConfig?.iconFontSet
      ? this.backButtonConfig?.iconFontSet
      : '';

  public getBreadcrumbFontSet = (breadcrumb: Breadcrumb): string =>
    breadcrumb?.iconFontSet ? breadcrumb.iconFontSet : '';
}

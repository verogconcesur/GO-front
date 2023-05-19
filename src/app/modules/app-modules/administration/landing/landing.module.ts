import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { LandingConfigComponent } from './components/landing-config/landing-config.component';
import { LandingLinksComponent } from './components/landing-links/landing-links.component';
import { LandingBannersComponent } from './components/landing-banners/landing-banners.component';
import { LandingRoutingModule } from './landing-routing.module';
import { SharedModule } from '@shared/shared.module';
import { FilterDrawerModule } from '@modules/feature-modules/filter-drawer/filter-drawer.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { MediaViewerDialogModule } from '@modules/feature-modules/media-viewer-dialog/media-viewer-dialog.module';

@NgModule({
  declarations: [LandingComponent, LandingConfigComponent, LandingLinksComponent, LandingBannersComponent],
  imports: [
    CommonModule,
    LandingRoutingModule,
    SharedModule,
    FilterDrawerModule,
    AdministrationCommonHeaderSectionModule,
    MediaViewerDialogModule
  ]
})
export class LandingModule {}

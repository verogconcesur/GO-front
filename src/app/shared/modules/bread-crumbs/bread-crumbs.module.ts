import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// import { BreadCrumbsService } from './services/bread-crumbs.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { BreadCrumbsComponent } from './component/bread-crumbs.component';

export class Loader implements TranslateLoader {
  private translations = new Subject();
  $translations = this.translations.asObservable();
  getTranslation(lang: string) {
    return this.$translations;
  }
}

export function LoaderFactory() {
  return new Loader();
}

@NgModule({
  declarations: [BreadCrumbsComponent],
  imports: [CommonModule, TranslateModule, RouterModule, MatButtonModule, MatIconModule],
  exports: [TranslateModule, BreadCrumbsComponent]
})
export class BreadCrumbsModule {}

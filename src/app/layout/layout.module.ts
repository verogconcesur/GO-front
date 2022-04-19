import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';

@NgModule({
  declarations: [DefaultLayoutComponent],
  imports: [RouterModule, SharedModule],
  exports: [DefaultLayoutComponent],
  providers: []
})
export class LayoutModule {}

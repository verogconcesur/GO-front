import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitiesSearcherDialogComponent } from './entities-searcher-dialog.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [EntitiesSearcherDialogComponent],
  imports: [CommonModule, SharedModule],
  exports: []
})
export class EntitiesSearcherDialogModule {}

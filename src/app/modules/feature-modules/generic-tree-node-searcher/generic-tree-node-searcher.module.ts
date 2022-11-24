import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTreeNodeSearcherComponent } from './generic-tree-node-searcher.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [GenericTreeNodeSearcherComponent],
  imports: [CommonModule, SharedModule],
  exports: [GenericTreeNodeSearcherComponent]
})
export class GenericTreeNodeSearcherModule {}

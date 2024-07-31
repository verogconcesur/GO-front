import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { LinksCreationEditionDialogComponent } from './links-creation-edition-dialog.component';
import { TextEditorWrapperModule } from '../text-editor-wrapper/text-editor-wrapper.module';

@NgModule({
  declarations: [LinksCreationEditionDialogComponent],
  imports: [CommonModule, SharedModule, TextEditorWrapperModule],
  exports: [LinksCreationEditionDialogComponent]
})
export class ModalLinksCreationEditionDialogModule {}

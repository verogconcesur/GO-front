import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillTextEditorWrapperComponent } from './quill-text-editor-wrapper.component';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from '@shared/shared.module';
import { QuillTextEditorHtmlDialogComponent } from './quill-text-editor-html-dialog/quill-text-editor-html-dialog.component';

@NgModule({
  declarations: [QuillTextEditorWrapperComponent, QuillTextEditorHtmlDialogComponent],
  imports: [CommonModule, SharedModule, QuillModule.forRoot()],
  exports: [QuillTextEditorWrapperComponent]
})
export class QuillTextEditorWrapperModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextEditorWrapperComponent } from './text-editor-wrapper.component';
import { NgxSummernoteModule } from 'ngx-summernote';

@NgModule({
  declarations: [TextEditorWrapperComponent],
  imports: [CommonModule, NgxSummernoteModule],
  exports: [TextEditorWrapperComponent]
})
export class TextEditorWrapperModule {}

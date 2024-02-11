/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignCardDocumentsDialogComponent } from './sign-card-documents-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { SignCardDocumentsDialogRoutingModule } from './sign-card-documents-dialog-routing.module';
import { SignDocumentTemplateSelectorComponent } from './subcomponents/sign-document-template-selector/sign-document-template-selector.component';
import { SignDocumentAddFileComponent } from './subcomponents/sign-document-add-file/sign-document-add-file.component';
import { SignDocumentChecklistComponent } from './subcomponents/sign-document-checklist/sign-document-checklist.component';
import { SignDocumentSaveLocationComponent } from './subcomponents/sign-document-save-location/sign-document-save-location.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ChangeSignComponent } from './subcomponents/change-sign/change-sign.component';
import { SignDocumentModeSelectorComponent } from './subcomponents/sign-document-mode-selector/sign-document-mode-selector.component';
import { SignDocumentChecklistNewComponent } from './subcomponents/sign-document-checklist-new/sign-document-checklist-new.component';
import { RemoteSignFormComponent } from './subcomponents/sign-document-checklist-new/steps/remote-sign-form/remote-sign-form.component';

@NgModule({
  declarations: [
    SignCardDocumentsDialogComponent,
    SignDocumentTemplateSelectorComponent,
    SignDocumentAddFileComponent,
    SignDocumentChecklistComponent,
    SignDocumentSaveLocationComponent,
    ChangeSignComponent,
    SignDocumentModeSelectorComponent,
    SignDocumentChecklistNewComponent,
    RemoteSignFormComponent
  ],
  imports: [CommonModule, SharedModule, SignCardDocumentsDialogRoutingModule, NgxExtendedPdfViewerModule]
})
export class SignCardDocumentsDialogModule {}

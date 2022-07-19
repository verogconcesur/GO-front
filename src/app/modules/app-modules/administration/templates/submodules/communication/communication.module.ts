import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunicationRoutingModule } from './communication-routing.module';
import { CommunicationComponent } from './communication.component';
import { SharedModule } from '@shared/shared.module';
import { CreateEditCommunicationComponent } from './dialog/create-edit-communication/create-edit-communication.component';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';

@NgModule({
  declarations: [CommunicationComponent, CreateEditCommunicationComponent],
  imports: [CommonModule, SharedModule, CommunicationRoutingModule, OrganizationLevelsNestedCombosModule, TextEditorWrapperModule]
})
export class CommunicationModule {}

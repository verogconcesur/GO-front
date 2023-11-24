import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentsRoutingModule } from './attachments-routing.module';
import { AttachmentsComponent } from './attachments.component';
import { SharedModule } from '@shared/shared.module';
import { CreateEditAttachmentComponent } from './dialog/create-edit-attachment/create-edit-attachment.component';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosModule } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.module';

@NgModule({
  declarations: [AttachmentsComponent, CreateEditAttachmentComponent],
  imports: [CommonModule, SharedModule, AttachmentsRoutingModule, OrganizationLevelsNestedCombosModule]
})
export class AttachmentsModule {}

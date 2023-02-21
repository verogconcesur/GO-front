/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';
import { WorkflowColumnCustomizableEntityComponent } from './subcomponents/workflow-column-customizable-entity/workflow-column-customizable-entity.component';
import { WorkflowColumnCustomizableCustomComponent } from './subcomponents/workflow-column-customizable-custom/workflow-column-customizable-custom.component';
import { WorkflowColumnTemplatesBudgetsComponent } from './subcomponents/workflow-column-templates-budgets/workflow-column-templates-budgets.component';
import { WorkflowColumnTemplatesAttachmentsComponent } from './subcomponents/workflow-column-templates-attachments/workflow-column-templates-attachments.component';
import { WorkflowColumnPrefixedInformationComponent } from './subcomponents/workflow-column-prefixed-information/workflow-column-prefixed-information.component';
import { WorkflowColumnPrefixedTasksComponent } from './subcomponents/workflow-column-prefixed-tasks/workflow-column-prefixed-tasks.component';
import { WorkflowColumnPrefixedHistoryComponent } from './subcomponents/workflow-column-prefixed-history/workflow-column-prefixed-history.component';
import { WorkflowCardHeaderComponent } from './subcomponents/workflow-card-header/workflow-card-header.component';
import { WorkflowColumnCommentsComponent } from './subcomponents/workflow-column-comments/workflow-column-comments.component';
import { WorkflowColumnClientMessagesComponent } from './subcomponents/workflow-column-client-messages/workflow-column-client-messages.component';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';
import { WorkflowColumnActionsAndLinksComponent } from './subcomponents/workflow-column-actions-and-links/workflow-column-actions-and-links.component';
import { MoveCardDialogComponent } from './subcomponents/move-card-dialog/move-card-dialog.component';
import { CardInstanceAttachmentsModule } from '@modules/feature-modules/card-instance-attachments/card-instance-attachments.module';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';
import { CardInstanceBudgetsModule } from '@modules/feature-modules/card-instance-budgets/card-instance-budgets.module';
import { EntitiesSearcherDialogModule } from '@modules/feature-modules/entities-searcher-dialog/entities-searcher-dialog.module';
import { ItemTitleComponent } from './subcomponents/workflow-column-customizable-custom/items/item-title/item-title.component';
import { ItemTextComponent } from './subcomponents/workflow-column-customizable-custom/items/item-text/item-text.component';
import { ItemInputComponent } from './subcomponents/workflow-column-customizable-custom/items/item-input/item-input.component';
import { ModalCustomerModule } from '@modules/feature-modules/modal-customer/modal-customer.module';
import { ModalVehicleModule } from '@modules/feature-modules/modal-vehicle/modal-vehicle.module';
import { MessageClientDialogComponent } from './subcomponents/message-client-dialog/message-client-dialog.component';
import { ItemOptionComponent } from './subcomponents/workflow-column-customizable-custom/items/item-option/item-option.component';
import { ItemListComponent } from './subcomponents/workflow-column-customizable-custom/items/item-list/item-list.component';
@NgModule({
  declarations: [
    WorkflowCardDetailsComponent,
    WorkflowCardColumnComponent,
    WorkflowColumnCustomizableEntityComponent,
    WorkflowColumnCustomizableCustomComponent,
    WorkflowColumnTemplatesBudgetsComponent,
    WorkflowColumnTemplatesAttachmentsComponent,
    WorkflowColumnPrefixedInformationComponent,
    WorkflowColumnPrefixedTasksComponent,
    WorkflowColumnPrefixedHistoryComponent,
    WorkflowCardHeaderComponent,
    WorkflowColumnCommentsComponent,
    WorkflowColumnClientMessagesComponent,
    WorkflowColumnActionsAndLinksComponent,
    MoveCardDialogComponent,
    ItemTitleComponent,
    ItemTextComponent,
    ItemInputComponent,
    MessageClientDialogComponent,
    ItemOptionComponent,
    ItemListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CardInstanceAttachmentsModule,
    CardInstanceBudgetsModule,
    WorkflowCardDetailsRoutingModule,
    TextEditorWrapperModule,
    WorkflowCardTasksModule,
    EntitiesSearcherDialogModule,
    ModalCustomerModule,
    ModalVehicleModule
  ]
})
export class WorkflowCardDetailsModule {}

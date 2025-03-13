/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CardInstanceAccountingModule } from '@modules/feature-modules/card-instance-accounting/card-instance-accounting.module';
import { CardInstanceAttachmentsModule } from '@modules/feature-modules/card-instance-attachments/card-instance-attachments.module';
import { CardInstanceBudgetsModule } from '@modules/feature-modules/card-instance-budgets/card-instance-budgets.module';
import { CardInstancePaymentsModule } from '@modules/feature-modules/card-instance-payments/card-instance-payments.module';
import { EntitiesSearcherDialogModule } from '@modules/feature-modules/entities-searcher-dialog/entities-searcher-dialog.module';
import { ModalChatWhatsappModule } from '@modules/feature-modules/modal-chat-whatsapp/modal-chat-whatsapp.module';
import { ModalCustomerModule } from '@modules/feature-modules/modal-customer/modal-customer.module';
import { ModalRepairOrderModule } from '@modules/feature-modules/modal-repair-order/modal-repair-order.module';
import { ModalStartConversationModule } from '@modules/feature-modules/modal-start-conversation/modal-start-conversation.module';
import { ModalVehicleModule } from '@modules/feature-modules/modal-vehicle/modal-vehicle.module';
import { TextEditorWrapperModule } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.module';
import { WorkflowCardTasksModule } from '@modules/feature-modules/workflow-card-tasks/workflow-card-tasks.module';
import { SharedModule } from '@shared/shared.module';
import { ModalCardCustomerAttachmentsModule } from '../../../../feature-modules/modal-card-customer-attachments/modal-card-customer-attachments.module';
import { MessageClientDialogComponent } from './subcomponents/message-client-dialog/message-client-dialog.component';
import { MoveCardDialogComponent } from './subcomponents/move-card-dialog/move-card-dialog.component';
import { WorkflowCardColumnComponent } from './subcomponents/workflow-card-column/workflow-card-column.component';
import { WorkflowCardHeaderComponent } from './subcomponents/workflow-card-header/workflow-card-header.component';
import { WorkflowColumnActionsAndLinksComponent } from './subcomponents/workflow-column-actions-and-links/workflow-column-actions-and-links.component';
import { WorkflowColumnClientMessagesComponent } from './subcomponents/workflow-column-client-messages/workflow-column-client-messages.component';
import { WorkflowColumnCommentsComponent } from './subcomponents/workflow-column-comments/workflow-column-comments.component';
import { ItemInputComponent } from './subcomponents/workflow-column-customizable-custom/items/item-input/item-input.component';
import { ItemListComponent } from './subcomponents/workflow-column-customizable-custom/items/item-list/item-list.component';
import { ItemOptionComponent } from './subcomponents/workflow-column-customizable-custom/items/item-option/item-option.component';
import { ItemTextComponent } from './subcomponents/workflow-column-customizable-custom/items/item-text/item-text.component';
import { ItemTitleComponent } from './subcomponents/workflow-column-customizable-custom/items/item-title/item-title.component';
import { WorkflowColumnCustomizableCustomComponent } from './subcomponents/workflow-column-customizable-custom/workflow-column-customizable-custom.component';
import { WorkflowColumnCustomizableEntityComponent } from './subcomponents/workflow-column-customizable-entity/workflow-column-customizable-entity.component';
import { WorkflowColumnPrefixedHistoryComponent } from './subcomponents/workflow-column-prefixed-history/workflow-column-prefixed-history.component';
import { WorkflowColumnPrefixedInformationComponent } from './subcomponents/workflow-column-prefixed-information/workflow-column-prefixed-information.component';
import { WorkflowColumnPrefixedTasksComponent } from './subcomponents/workflow-column-prefixed-tasks/workflow-column-prefixed-tasks.component';
import { WorkflowColumnTemplatesAccountingComponent } from './subcomponents/workflow-column-templates-accounting/workflow-column-templates-accounting.component';
import { WorkflowColumnTemplatesAttachmentsComponent } from './subcomponents/workflow-column-templates-attachments/workflow-column-templates-attachments.component';
import { WorkflowColumnTemplatesBudgetsComponent } from './subcomponents/workflow-column-templates-budgets/workflow-column-templates-budgets.component';
import { WorkflowColumnTemplatesPaymentsComponent } from './subcomponents/workflow-column-templates-payments/workflow-column-templates-payments.component';
import { WorkflowCardDetailsRoutingModule } from './workflow-card-details-routing.module';
import { WorkflowCardDetailsComponent } from './workflow-card-details.component';
@NgModule({
  declarations: [
    WorkflowCardDetailsComponent,
    WorkflowCardColumnComponent,
    WorkflowColumnCustomizableEntityComponent,
    WorkflowColumnCustomizableCustomComponent,
    WorkflowColumnTemplatesBudgetsComponent,
    WorkflowColumnTemplatesPaymentsComponent,
    WorkflowColumnTemplatesAccountingComponent,
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
    CardInstancePaymentsModule,
    CardInstanceAccountingModule,
    WorkflowCardDetailsRoutingModule,
    TextEditorWrapperModule,
    WorkflowCardTasksModule,
    EntitiesSearcherDialogModule,
    ModalCustomerModule,
    ModalVehicleModule,
    ModalRepairOrderModule,
    ModalStartConversationModule,
    ModalChatWhatsappModule,
    ModalCardCustomerAttachmentsModule
  ]
})
export class WorkflowCardDetailsModule {}

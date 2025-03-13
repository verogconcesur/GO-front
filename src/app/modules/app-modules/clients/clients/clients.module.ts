/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalAssociatedCardsModule } from '@modules/feature-modules/modal-associated-cards/modal-associated-cards.module';

// eslint-disable-next-line max-len
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { MatTabsModule } from '@angular/material/tabs';
import { CardInstanceAttachmentsModule } from '@modules/feature-modules/card-instance-attachments/card-instance-attachments.module';
import { AdministrationCommonHeaderSectionModule } from '../../../feature-modules/administration-common-header-section/administration-common-header-section.module';
import { ClientsListComponent } from '../components/clients-list/clients-list.component';
import { ModalCustomerAttachmentsComponent } from '../components/modal-customer-attachments/modal-customer-attachments.component';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';

@NgModule({
  declarations: [ClientsComponent, ClientsListComponent, ModalCustomerAttachmentsComponent],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
    AdministrationCommonHeaderSectionModule,
    ModalAssociatedCardsModule,
    MatTabsModule,
    CardInstanceAttachmentsModule
  ]
})
export class ClientsModule {}

/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// eslint-disable-next-line max-len
import { SharedModule } from '@shared/shared.module';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '../../../feature-modules/administration-common-header-section/administration-common-header-section.module';
import { ClientsListComponent } from '../components/clients-list/clients-list.component';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';

@NgModule({
  declarations: [ClientsComponent, ClientsListComponent],
  imports: [CommonModule, ClientsRoutingModule, SharedModule, AdministrationCommonHeaderSectionModule]
})
export class ClientsModule {}

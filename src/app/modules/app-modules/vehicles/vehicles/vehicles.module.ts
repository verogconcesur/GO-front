import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionModule } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.module';
import { ModalAssociatedCardsModule } from '@modules/feature-modules/modal-associated-cards/modal-associated-cards.module';
import { SharedModule } from '@shared/shared.module';
import { VehiclesListComponent } from '../components/vehicles-list/vehicles-list.component';
import { VehiclesRoutingModule } from './vehicles-routing.module';
import { VehiclesComponent } from './vehicles.component';

@NgModule({
  declarations: [VehiclesComponent, VehiclesListComponent],
  imports: [
    CommonModule,
    VehiclesRoutingModule,
    SharedModule,
    AdministrationCommonHeaderSectionModule,
    ModalAssociatedCardsModule
  ]
})
export class VehiclesModule {}

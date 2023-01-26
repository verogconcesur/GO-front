import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalVehicleExternalApiComponent } from './modal-vehicle-external-api.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalVehicleExternalApiComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalVehicleExternalApiComponent]
})
export class ModalVehicleExternalApiModule {}

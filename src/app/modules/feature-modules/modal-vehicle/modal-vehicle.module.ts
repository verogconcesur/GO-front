import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalVehicleComponent } from './modal-vehicle.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ModalVehicleComponent],
  imports: [CommonModule, SharedModule],
  exports: [ModalVehicleComponent]
})
export class ModalVehicleModule {}

import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { VehiclesListComponent } from '../components/vehicles-list/vehicles-list.component';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  @ViewChild('vehiclesList') vehiclesListComponent: VehiclesListComponent;

  public labels = {
    createVehicle: marker('entities.vehicles.create'),
    title: marker('entities.vehicles.title')
  };

  constructor() {}

  ngOnInit(): void {}

  buttonCreateAction() {
    this.vehiclesListComponent.openCreateEditVehicleDialog();
  }
}

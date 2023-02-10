import { Component, OnInit, ViewChild } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { Observable } from 'rxjs';
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
  public getFilteredData = (text: string): Observable<{ content: VehicleEntityDTO[] } | null> =>
    this.vehiclesListComponent.getFilteredData(text);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    return this.vehiclesListComponent.showFilterOptionSelected(option);
  }
}

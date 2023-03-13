import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import { Observable } from 'rxjs';
import { EntitiesSearcherDialogComponent } from './entities-searcher-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class EntitiesSearcherDialogService implements OnDestroy {
  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {}

  public openEntitySearcher(
    workflowId: number,
    facilityId: number,
    mode: 'USER' | 'CUSTOMER' | 'VEHICLE' | 'REPAIRORDER'
  ): Promise<{ entity: UserDTO | VehicleEntityDTO | CustomerEntityDTO | RepairOrderEntityDTO; vehicleInventoryId: number }> {
    return new Promise((resolve, reject) => {
      this.dialog
        .open(EntitiesSearcherDialogComponent, {
          width: '600px',
          panelClass: 'entities-searcher',
          disableClose: true,
          data: { workflowId, facilityId, mode }
        })
        .afterClosed()
        .subscribe(
          (data: {
            entity: UserDTO | VehicleEntityDTO | CustomerEntityDTO | RepairOrderEntityDTO;
            vehicleInventoryId: number;
          }) => {
            resolve(data);
          }
        );
    });
  }
}

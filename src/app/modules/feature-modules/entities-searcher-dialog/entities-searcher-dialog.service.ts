import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
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
    mode: 'USER' | 'CUSTOMER' | 'VEHICLE'
  ): Promise<UserDTO | VehicleEntityDTO | CustomerEntityDTO> {
    return new Promise((resolve, reject) => {
      this.dialog
        .open(EntitiesSearcherDialogComponent, {
          width: '500px',
          height: '240px',
          panelClass: 'entities-searcher',
          disableClose: true,
          data: { workflowId, mode }
        })
        .afterClosed()
        .subscribe((data: UserDTO | VehicleEntityDTO | CustomerEntityDTO) => {
          resolve(data);
        });
    });
  }
}

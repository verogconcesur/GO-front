import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepColumnService {
  private customerId = new BehaviorSubject<number>(null);
  private vehicleId = new BehaviorSubject<number>(null);

  setVehicleId(value: number) {
    this.vehicleId.next(value);
  }

  setCustomerId(value: number) {
    this.customerId.next(value);
  }

  getCustomerId(): number {
    return this.customerId.getValue();
  }
  getVehicleId(): number {
    return this.vehicleId.getValue();
  }
  resetVariables() {
    this.customerId.next(null);
    this.vehicleId.next(null);
  }
}

export default interface VehicleFilterDTO {
  facilityId: number;
  commissionNumber: string;
  inventoryType: string;
  inventoryVehicleStatus: string;
  licensePlate: string;
  vin: string;
}
export const VehicleInventoryTypes = ['NEW', 'USED'];
export const VehicleStatus = ['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE'];

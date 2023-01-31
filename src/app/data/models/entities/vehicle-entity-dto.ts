export default interface VehicleEntityDTO {
  stockId: string;
  status: string;
  inventoryType: string;
  commissionNumber: string;
  chasis: string;
  vehicleId: string;
  model: string;
  make: string;
  description: string;
  id: number;
  licensePlate: string;
  reference: string;
  vin: string;
  inventories: InventoryVehicle[];
}
export interface InventoryVehicle {
  id: number;
  commissionNumber: string;
  inventoryType: string;
  status: string;
  vehicleStockId: string;
}

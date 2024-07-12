import FacilityDTO from '../organization/facility-dto';

export default interface VehicleEntityDTO {
  stockId?: string;
  status?: string;
  inventoryType?: string;
  commissionNumber?: string;
  variantCode?: string;
  chassis?: string;
  vehicleId?: string;
  facility?: FacilityDTO;
  model?: string;
  make?: string;
  description?: string;
  id?: number;
  licensePlate?: string;
  reference?: string;
  vin?: string;
  inventories?: InventoryVehicle[];
  cardInstanceId?: number;
}
export interface InventoryVehicle {
  id?: number;
  commissionNumber?: string;
  inventoryType?: string;
  status?: string;
  vehicleStockId?: string;
  enterpriseId?: number;
  storeId?: number;
  facilityId?: number;
}
export interface TakeAllVehicle {
  make: string;
  makeCode: string;
  model: string;
  modelCode: string;
  variants: Variants;
}
export interface Variants {
  [key: string]: string[];
}

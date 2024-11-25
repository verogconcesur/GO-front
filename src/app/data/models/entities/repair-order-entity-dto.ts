import FacilityDTO from '../organization/facility-dto';

export default interface RepairOrderEntityDTO {
  id: number;
  reference: string;
  jobsDescription?: string;
  dueInDatetime: string;
  customer: {
    id: number;
  };
  vehicle: {
    id: number;
  };
  facility: FacilityDTO;
  repairOrderId?: number;
  notes: string;
}

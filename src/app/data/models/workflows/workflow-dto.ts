import FacilityDTO from '../organization/facility-dto';

export default interface WorkflowDTO {
  id: number;
  name: string;
  status: string;
  facilities?: FacilityDTO[];
}

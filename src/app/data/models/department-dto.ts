import FacilityDTO from './facility-dto';

export default interface DepartmentDTO {
  id: number;
  name: string;
  facilities: FacilityDTO[];
  numSpecialties?: number;
}

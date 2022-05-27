import FacilityDTO from './facility-dto';

export default interface DepartmentDTO {
  id: number;
  name: string;
  facility: FacilityDTO;
  numSpecialties?: number;
}

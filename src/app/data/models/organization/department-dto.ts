import FacilityDTO from './facility-dto';

export default interface DepartmentDTO {
  id: number;
  name?: string;
  email?: string;
  facilities?: FacilityDTO[];
  facility?: FacilityDTO;
  numSpecialties?: number;
  footer?: string;
  header?: string;
}

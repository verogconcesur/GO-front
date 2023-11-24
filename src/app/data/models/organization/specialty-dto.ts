import DepartmentDTO from './department-dto';

export default interface SpecialtyDTO {
  id: number;
  name?: string;
  departments?: DepartmentDTO[];
  department?: DepartmentDTO;
  email?: string;
  footer?: string;
  header?: string;
}

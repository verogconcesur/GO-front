import SpecialtyDTO from '@data/models/specialty-dto';

export default interface SpecialtiesGroupedByDepartment {
  departmentId: number;
  departmentName: string;
  specialties: SpecialtyDTO[];
}

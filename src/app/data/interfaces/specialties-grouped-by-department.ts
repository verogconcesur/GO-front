import SpecialtyDTO from '@data/models/organization/specialty-dto';

export default interface SpecialtiesGroupedByDepartment {
  departmentId: number;
  departmentName: string;
  specialties: SpecialtyDTO[];
  tooltipDepartmentName?: string;
}

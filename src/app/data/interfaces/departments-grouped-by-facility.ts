import DepartmentDTO from '@data/models/department-dto';

export default interface DepartmentsGroupedByFacility {
  facilityId: number;
  facilityName: string;
  departments: DepartmentDTO[];
  tooltipFacilityName?: string;
}

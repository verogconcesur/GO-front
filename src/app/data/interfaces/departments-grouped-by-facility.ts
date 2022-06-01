import DepartmentDTO from '@data/models/department-dto';

export default interface DespartmentsGroupedByFacility {
  facilityId: number;
  facilityName: string;
  departments: DepartmentDTO[];
}

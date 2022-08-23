import WorkflowDto from './workflow-dto';

export default interface WorkflowListByFacilityDto {
  id: number;
  facilityId: number;
  facilityName: string;
  workflows: WorkflowDto[];
}

import WorkflowDTO from './workflow-dto';

export default interface WorkflowListByFacilityDTO {
  id: number;
  facilityId: number;
  facilityName: string;
  workflows: WorkflowDTO[];
}

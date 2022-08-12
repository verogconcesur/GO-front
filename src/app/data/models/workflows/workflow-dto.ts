export default interface WorkflowDto {
  id: number;
  name: string;
  status: string;
  facility?: { facilityId: number; facilityName: string };
}

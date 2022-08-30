export default interface WorkflowDTO {
  id: number;
  name: string;
  status: string;
  facility?: { facilityId: number; facilityName: string };
}

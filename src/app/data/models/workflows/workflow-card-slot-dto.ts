export default interface WorkflowCardSlotDTO {
  attributeName: string;
  entityName: string;
  id: number;
  dataType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  name?: string;
  contentSource?: {
    contentType: string;
    id: number;
    name: string;
  };
}

export default interface WorkflowCardSlotDTO {
  attributeName: string;
  entityName: string;
  id: number;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'TIME' | 'DATETIME';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  name?: string;
  fullName?: string;
  contentSource?: {
    contentType: {
      id: number;
      name: string;
      type: 'CUSTOMIZABLE' | 'TEMPLATE' | 'PREFIXED';
    };
    id: number;
    name: string;
  };
}

import { AttachmentDTO } from '../cards/card-attachments-dto';

export default interface MigrationDTO {
  facilityId: number;
  fileToImport: AttachmentDTO;
  workflowId: number;
  historic?: boolean;
  retryLastMigration?: boolean;
}

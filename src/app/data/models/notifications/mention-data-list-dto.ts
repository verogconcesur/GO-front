import WorkflowCardDTO from '../workflows/workflow-card-dto';

export default interface MentionDataListDTO {
  cardInstanceCommentId: number;
  comment: string;
  read: boolean;
  dateComment: Date;
  cardInstance: WorkflowCardDTO;
}

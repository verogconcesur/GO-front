export default interface MentionFilterDTO {
  dateCommentFrom?: string;
  dateCommentTo?: string;
  mention?: boolean;
  readFilterType?: 'READ' | 'NO_READ' | 'ALL';
  text?: string;
  userId?: number;
}

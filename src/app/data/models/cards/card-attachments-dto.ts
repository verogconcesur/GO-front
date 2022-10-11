export interface AttachmentDTO {
  content: string;
  id: number;
  name: string;
  size: number;
  thumbnail: string;
  type: string;
}

export interface CardAttachmentsDTO {
  attachments: AttachmentDTO[];
  templateAttachmentItem: {
    id: number;
    name: string;
    orderNumber: number;
  };
}

import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';

export type ConcenetError = {
  timeStamp: Date;
  status: number;
  error: string;
  message: string;
  path: string;
  code?: string;
  requiredFields?: CardColumnTabItemDTO[];
  requiredAttachments: CardColumnTabItemDTO[];
};

import CardContentTypeDTO from './card-content-type-dto';

export default interface CardContentSourceDTO {
  id: number;
  name: string;
  contentType: CardContentTypeDTO;
}

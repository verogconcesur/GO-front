export default interface CardColumnTabItemDto {
  typeItem: string;
  orderNumber: number;
  name: string;
  description: string;
  tabItemConfigVariable: { variable: { id: number } };
}

export default interface CardColumnTabItemDTO {
  typeItem: string;
  orderNumber: number;
  name: string;
  description: string;
  tabItemConfigVariable: { variable: { id: number } };
}

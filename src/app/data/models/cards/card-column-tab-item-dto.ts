export default interface CardColumnTabItemDTO {
  id?: number;
  tabId?: number;
  typeItem: string;
  orderNumber: number;
  name: string;
  description: string;
  tabItemConfigVariable?: { variable: { id: number } };
  tabItemConfigAction?: { id: number; tabItemId: number; actionType: string; visible: boolean };
}

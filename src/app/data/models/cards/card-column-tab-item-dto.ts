export default interface CardColumnTabItemDTO {
  id?: number;
  tabId?: number;
  typeItem: 'TITLE' | 'TEXT' | 'INPUT' | 'LIST' | 'TABLE' | 'OPTION' | 'VARIABLE' | 'LINK' | 'ACTION';
  orderNumber: number;
  name: string;
  description: string;
  tabItemConfigVariable?: { variable: { id: number; attributeName: string }; visible: boolean };
  tabItemConfigAction?: { id: number; tabItemId: number; actionType: string; visible: boolean };
  tabItemConfigLink?: { id: number; tabItemId: number; link: string; color: string };
}

export default interface CardColumnTabItemDTO {
  id?: number;
  tabId?: number;
  typeItem: 'TITLE' | 'TEXT' | 'INPUT' | 'LIST' | 'TABLE' | 'OPTION' | 'VARIABLE' | 'LINK' | 'ACTION';
  orderNumber: number;
  name: string;
  description: string;
  tabItemConfigAction?: TabItemConfigActionDTO;
  tabItemConfigInput?: TabItemConfigInputDTO;
  tabItemConfigLink?: TabItemConfigLinkDTO;
  tabItemConfigList?: TabItemConfigListDTO;
  tabItemConfigOption?: TabItemConfigOptionDTO;
  tabItemConfigTable?: TabItemConfigTableDTO;
  tabItemConfigText?: TabItemConfigTextDTO;
  tabItemConfigTitle?: TabItemConfigTitleDTO;
  tabItemConfigVariable?: TabItemConfigVariableDTO;
}
export interface TabItemConfigActionDTO {
  id?: number;
  tabItemId?: number;
  actionType: 'SIGN_DOC' | 'MESSAGE_CLIENT' | 'ATTACH_DOC';
  visible: boolean;
}
export interface TabItemConfigInputDTO {
  id?: number;
  tabItemId?: number;
  description: string;
  dataType: 'STRING' | 'NUMBER' | 'TEMPORAL';
  dateApplyColor?: string;
  dateColor?: boolean;
  dateLimit?: boolean;
  dateType?: 'DATETIME' | 'DATE' | 'TIME';
  mandatory?: boolean;
  numDecimals?: number;
}
export interface TabItemConfigCommonDTO {
  id?: number;
  tabItemId?: number;
}
export interface TabItemConfigLinkDTO extends TabItemConfigCommonDTO {
  link: string;
  color: string;
}
export interface TabItemConfigListDTO extends TabItemConfigCommonDTO {
  description?: string;
  code: string;
  listItems: TabItemConfigListItemDTO[];
  mandatory?: boolean;
  parentCode: string;
  selectionType: 'SIMPLE' | 'MULTIPLE';
}
export interface TabItemConfigListItemDTO extends TabItemConfigCommonDTO {
  tabItemConfigListId?: number;
  value: string;
  code: string;
  parentCode: string;
}
export interface TabItemConfigOptionDTO extends TabItemConfigCommonDTO {
  description?: string;
  applyColor: string;
  color: string;
  overridePriority: boolean;
}
export interface TabItemConfigTableDTO extends TabItemConfigCommonDTO {
  description?: string;
  readOption: 'READONLY' | 'READWRITE';
  tabItemConfigTableCols: TabItemConfigTableColDTO[];
}
export interface TabItemConfigTableColDTO extends TabItemConfigCommonDTO {
  description?: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN';
  header: string;
  mandatory?: boolean;
  orderNumber: number;
  tabItemConfigTableId?: number;
  tabItemTableColValues: TabItemTableColValueDTO[];
}
export interface TabItemTableColValueDTO extends TabItemConfigCommonDTO {
  rowCode?: number;
  tabItemConfigTableColId?: number;
  valueBoolean?: boolean;
  valueNumber?: number;
  valueString?: string;
}
export interface TabItemConfigTextDTO extends TabItemConfigCommonDTO {
  description?: string;
  value?: string;
}
export interface TabItemConfigTitleDTO extends TabItemConfigCommonDTO {
  description?: string;
  value?: string;
}
export interface TabItemConfigVariableDTO extends TabItemConfigCommonDTO {
  variable: {
    id: number;
    attributeName: string;
    value: string;
  };
  visible: boolean;
}

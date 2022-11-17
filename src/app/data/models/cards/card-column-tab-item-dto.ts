import TreeNode from '@data/interfaces/tree-node';

// export const TabItemsCustomTypes = ['TITLE', 'TEXT', 'INPUT', 'LIST', 'TABLE', 'OPTION'];
export const TabItemsCustomTypes = ['TITLE', 'TEXT', 'INPUT'];
// export const InputDataTypes = ['STRING', 'NUMBER', 'TEMPORAL'];
export const InputDataTypes = [
  { value: 'STRING', label: 'cards.column.dataType.string' },
  { value: 'NUMBER', label: 'cards.column.dataType.number' },
  { value: 'TEMPORAL', label: 'cards.column.dataType.temporal' }
];
// export const InputDateTypes = ['DATETIME', 'DATE', 'TIME'];
export const InputDateTypes = [
  { value: 'DATETIME', label: 'cards.column.dateType.datetime' },
  { value: 'DATE', label: 'cards.column.dateType.date' },
  { value: 'TIME', label: 'cards.column.dateType.time' }
];
export default interface CardColumnTabItemDTO extends TreeNode {
  id?: number;
  tabId?: number;
  typeItem: string;
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
export interface TabItemConfigCommonDTO {
  id?: number;
  tabItemId?: number;
}
export interface TabItemConfigInputDTO extends TabItemConfigCommonDTO {
  description: string;
  dataType: 'STRING' | 'NUMBER' | 'TEMPORAL';
  dateApplyColor?: boolean;
  dateColor?: string;
  dateLimit?: boolean;
  dateType?: 'DATETIME' | 'DATE' | 'TIME';
  mandatory?: boolean;
  numDecimals?: number;
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
    name: string;
  };
  visible: boolean;
}

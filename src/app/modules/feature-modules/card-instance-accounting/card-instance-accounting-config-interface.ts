export default interface CardInstanceAccountingConfig {
  tabId: number;
  wcId: number;
  workflowId: number;
  permission?: string;
  disableAccountingAdditionAction?: boolean;
  disableIndividualDeleteAction?: boolean;
}

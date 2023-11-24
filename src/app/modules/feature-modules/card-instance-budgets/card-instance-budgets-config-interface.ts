export default interface CardInstanceBudgetsConfig {
  tabId: number;
  wcId: number;
  workflowId: number;
  permission?: string;
  disableBudgetsAdditionAction?: boolean;
  disableIndividualDeleteAction?: boolean;
}

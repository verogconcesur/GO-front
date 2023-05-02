export default interface CardInstancePaymentsConfig {
  tabId: number;
  wcId: number;
  workflowId: number;
  permission?: string;
  disablePaymentsAdditionAction?: boolean;
  disableIndividualDeleteAction?: boolean;
}

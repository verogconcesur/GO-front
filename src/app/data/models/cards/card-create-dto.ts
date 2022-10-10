export default interface CardCreateDTO {
  workflowId: number;
  cardInstance: {
    vehicleId?: number;
    customerId?: number;
    information?: string;
    userId?: number;
  };
  workflowSubstateId: number;
  facilityId: number;
}

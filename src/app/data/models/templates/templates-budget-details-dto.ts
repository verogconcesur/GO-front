import TemplatesBudgetDTO from './templates-budget-dto';

export interface TemplateBudgetLinesDTO {
  amount: number;
  description: string;
  id: number;
  orderNumber: number;
}

export default interface TemplatesBudgetDetailsDTO {
  endDate: Date;
  id: number;
  startDate: Date;
  templateBudgetLines: TemplateBudgetLinesDTO[];
  template: TemplatesBudgetDTO;
}

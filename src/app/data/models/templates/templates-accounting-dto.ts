import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';

export interface AccountingLineSign {
  value: number;
  description: string;
}

export const AccountingLineSignsConst: AccountingLineSign[] = [
  { value: 1, description: '+ Suma' },
  { value: -1, description: '- Resta' }
];

export interface TemplateAccountingItemListDTO {
  name: string;
  id: number;
  orderNumber: number;
}
export interface AccountingBlockTypeDTO {
  id: number;
  description: string;
}
export interface AccountingLineTypeDTO {
  id: number;
  description: string;
}

export interface AccountingTaxTypeDTO {
  id: number;
  description: string;
  value: number;
}

export interface TemplateAccountingItemLineDTO {
  id?: number;
  orderNumber?: number;
  accountingLineType?: AccountingLineTypeDTO;
  accumulated?: boolean;
  accumulatedLines?: { id: number }[];
  description?: string;
  sign?: number;
  taxApply?: boolean;
  templateAccountingItemId?: number;
}

export interface TemplateAccountingItemDTO {
  id?: number;
  orderNumber?: number;
  accountingBlockType?: AccountingBlockTypeDTO;
  description?: string;
  descriptionTotal?: string;
  descriptionTotalPlusTax?: string;
  descriptionTotalTax?: string;
  templateAccountingItemLines?: TemplateAccountingItemLineDTO[];
}

export interface TemplatesAccountingDTO {
  id: number;
  template: {
    brands: BrandDTO[];
    departments: DepartmentDTO[];
    facilities: FacilityDTO[];
    id: number;
    name: string;
    specialties: SpecialtyDTO[];
    templateType: string;
  };
  templateAccountingItems: TemplateAccountingItemDTO[];
}

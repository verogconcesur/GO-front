import TownDTO from '../location/town-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';
import BrandDTO from './brand-dto';

export default interface FacilityDTO {
  id: number;
  address?: string;
  brands?: BrandDTO[];
  cif?: string;
  email?: string;
  footer?: string;
  header?: string;
  name?: string;
  numDepartments?: number;
  postalCode?: string;
  town?: TownDTO;
  requireConfigApiExt?: boolean;
  configApiExtDefault?: boolean;
  requireConfigStockApiExt?: boolean;
  code?: string;
  configStockCode?: string;
  enterpriseId?: string;
  configStockEnterpriseId?: string;
  storeId?: string;
  configStockStoreId?: string;
  workflowSubstate?: WorkflowSubstateDTO;
  configStockSubstates?: ConfigStockSubstate[];
  showInLanding?: boolean;
  configMailerHost?: string;
  configMailerPort?: string;
  configMailerUserName?: string;
  configMailerPass?: string;
  senderSms?: string;
  whatsappPhoneNumber?: string;
  whatsappSender?: string;
  //TPV config
  keyCommerce?: string;
  tpvCode?: string;
  tpvTerminal?: string;
}

export interface ConfigStockSubstate {
  id?: number;
  facilityId?: number;
  inventoryType: 'USED' | 'NEW';
  workflowSubstate?: WorkflowSubstateDTO;
}

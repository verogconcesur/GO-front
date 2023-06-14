import BrandDTO from './brand-dto';
import TownDTO from '../location/town-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';

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
  code?: string;
  enterpriseId?: string;
  storeId?: string;
  workflowSubstate?: WorkflowSubstateDTO;
  showInLanding?: boolean;
  configMailerHost?: string;
  configMailerPort?: string;
  configMailerUserName?: string;
  configMailerPass?: string;
  senderSms?: string;
}

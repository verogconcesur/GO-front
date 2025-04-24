import { AdvancedSearchItem } from '../adv-search/adv-search-dto';
import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import TemplatesCommunicationDTO from '../templates/templates-communication-dto';
import RoleDTO from '../user-permissions/role-dto';
import VariablesDTO from '../variables-dto';
import WorkflowCardsLimitDTO from '../workflow-admin/workflow-card-limit-dto';
import WorkflowEventMailDTO from './workflow-event-mail-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';

export interface WorkflowEventWebserviceConfigDTO {
  authAttributeToken: string;
  authPass: string;
  authUrl: string;
  authUser: string;
  blocker: boolean;
  body: string;
  id: number;
  method: 'GET' | 'POST';
  requireAuth: boolean;
  variables: VariablesDTO[];
  webserviceUrl: string;
}
export default interface WorkflowMoveDTO {
  id: number;
  orderNumber: number;
  groupName?: string;
  requiredFields: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requiredFieldsList: CardColumnTabItemDTO[];
  requiredHistoryComment: boolean;
  requiredMyself: boolean;
  requiredSize: boolean;
  requiredUser: boolean;
  webservice: boolean;
  workflowEventWebserviceConfig: WorkflowEventWebserviceConfigDTO;
  roles: RoleDTO[];
  sendMail: boolean;
  workflowEventMails: WorkflowEventMailDTO[];
  shortcut: boolean;
  shortcutColor: string;
  shortcutName: string;
  signDocument: boolean;
  signDocumentTemplate: TemplatesCommunicationDTO;
  workflowCardsLimit?: WorkflowCardsLimitDTO;
  workflowSubstateSource: WorkflowSubstateDTO;
  workflowSubstateTarget: WorkflowSubstateDTO;
  workflowSubstateTargetExtra?: WorkflowSubstateDTO;
  movementExtraAuto?: boolean;
  movementExtraConfirm?: boolean;
  requiredMovementExtra?: boolean;
  requiredAttachments?: boolean;
  workflowSubstateEventRequiredAttachments?: WorkflowSubstateEventRequiredAttachment[];
  workflowMovementRequiredAttachments?: WorkflowSubstateEventRequiredAttachment[];
  requiredSizeCriteriaConditions?: AdvancedSearchItem[];
  webserviceCriteriaConditions?: AdvancedSearchItem[];
  requiredMyselfCriteriaConditions?: AdvancedSearchItem[];
  requiredUserCriteriaConditions?: AdvancedSearchItem[];
}
export interface WorkflowSubstateEventRequiredAttachment {
  tab: { id: number };
  templateAttachmentItem: { id: number };
  numMinAttachRequired: number;
  workflowEventCondition?: {
    id: number;
    workflowEventType: string;
    workflowEventConditionItems: AdvancedSearchItem[];
    workflowMovementRequiredAttachmentId: number;
  };
}

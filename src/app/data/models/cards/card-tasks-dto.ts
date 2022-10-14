import FacilityDTO from '../organization/facility-dto';
import UserDTO from '../user-permissions/user-dto';
import WorkflowDTO from '../workflows/workflow-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '../workflows/workflow-substate-user-dto';

export interface CardTaskDTO {
  cardInstanceWorkflowOrigenId: number;
  cardInstanceWorkflowTasks: CardTaskDTO[];
  cardInstanceWorkflowUsers: WorkflowSubstateUserDTO[];
  facility: FacilityDTO;
  id: number;
  information: string;
  taskStatus: 'COMPLETED' | 'PENDING';
  workflow: WorkflowDTO;
  workflowSubstate: WorkflowSubstateDTO;
  completedDate: string;
  completedUser: UserDTO;
}

import { PermissionConstants } from './permission.constants';

export const RoutingUseHash = true;

export enum RouteConstants {
  // Common
  EMPTY = '',
  CREATE = 'create',
  CLONE = 'clone',
  EDIT = 'edit',
  DISPLAY = 'display',
  BACK = 'back',
  OTHER = '**',

  // Route Params
  ID = ':id',

  // Login
  LOGIN = 'login',
  FORGOT_PASSWORD = 'forgot-password',
  RESTORE_PASSWORD = 'restore-password',

  // Dashboard
  DASHBOARD = 'dashboard',

  // Workflows
  WORKFLOWS = 'workflow',
  WORKFLOW_ID = ':wId',
  WORKFLOWS_TABLE_VIEW = 'tableView',
  WORKFLOWS_BOARD_VIEW = 'boardView',
  WORKFLOWS_CALENDAR_VIEW = 'calendarView',
  WORKFLOWS_CARD = 'card',
  WORKFLOWS_ID_CARD = 'wcId',
  WORKFLOWS_ID_USER = 'wuId',
  WORKFLOWS_CARD_SIGN = 'cardSign',
  ID_USER = ':idUser',

  //Administration
  ADMINISTRATION = 'administration',

  //Users
  USERS = 'users',

  //Organization
  ORGANIZATION = 'organization',
  BRANDS = 'brands',
  ID_BRAND = ':idBrand',
  FACILITIES = 'facilities',
  ID_FACILITY = ':idFacility',
  DEPARTMENTS = 'departments',
  ID_DEPARTMENT = ':idDepartment',
  SPECIALTIES = 'specialties',

  //Templates
  TEMPLATES = 'templates',
  COMMUNICATIONS = 'communications',
  BUDGETS = 'budgets',
  CHECKLISTS = 'checklists',
  CREATE_EDIT_CHECKLIST = 'create-edit-checklist',
  ATTACHMENTS = 'attachments',
  CLIENT_TIMELINE = 'client-timeline',

  //Cards
  CARDS = 'cards',
  CREATE_CARD = 'create',
  ID_CARD = ':idCard',

  //Wokflows
  ADM_WORKFLOWS = 'workflows',
  CREATE_WORKFLOW = 'create',
  ID_WORKFLOW = ':idWorkflow'
}

export const RoutePermissionConstants: Record<string, PermissionConstants[]> = {
  //For routes with permissions specify an array with the permissions that the user must have to access
  // (as long as one is met, he can access)
  DASHBOARD: [],
  ADMINISTRATION: [PermissionConstants.ISADMIN]
};

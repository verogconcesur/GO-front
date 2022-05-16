import { PermissionConstants } from './permission.constants';

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
  ID = '/:id',

  // Login
  LOGIN = 'login',
  FORGOT_PASSWORD = 'forgot-password',
  RESTORE_PASSWORD = 'restore-password',

  // Dashboard
  DASHBOARD = 'dashboard'
}

export const RoutePermissionConstants: Record<string, PermissionConstants[]> = {
  //For routes with permissions specify an array with the permissions that the user must have to access
  // (as long as one is met, he can access)
  DASHBOARD: [] //For example [PermissionConstants.ISADMIN]
};

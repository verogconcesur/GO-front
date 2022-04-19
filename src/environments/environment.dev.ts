import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-dev`,
  production: false,
  // eslint-disable-next-line
  apiBaseUrl: '${API_BASE_URL}',
  logLevel: NgxLoggerLevel.DEBUG
};

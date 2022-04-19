import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-pre`,
  production: true,
  apiBaseUrl: '',
  logLevel: NgxLoggerLevel.DEBUG
};

import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-dev.local`,
  production: false,
  apiBaseUrl: '',
  logLevel: NgxLoggerLevel.DEBUG
};

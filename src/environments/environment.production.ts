import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}`,
  production: true,
  apiBaseUrl: 'https://go.grupoconcesur.es/concenet-rest',
  logLevel: NgxLoggerLevel.ERROR
};

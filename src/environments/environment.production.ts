import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}`,
  production: true,
  socketsEnabled: false,
  apiBaseUrl: 'https://go.grupoconcesur.es/concenet-rest',
  socketUrl: 'wss://go.grupoconcesur.es/concenet-rest/socket/',
  logLevel: NgxLoggerLevel.ERROR
};

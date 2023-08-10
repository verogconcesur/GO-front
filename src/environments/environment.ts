import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-dev.local`,
  production: false,
  socketsEnabled: false,
  apiBaseUrl: 'https://concenet-dev.sdos.es/concenet-rest',
  socketUrl: 'wss://concenet-dev.sdos.es/concenet-rest/socket/',
  logLevel: NgxLoggerLevel.DEBUG
};

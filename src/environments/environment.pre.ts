import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

export const environment: Env = {
  appVersion: `${require('../../package.json').version}-pre`,
  production: true,
  apiBaseUrl: 'https://concenet-pre.sdos.es/concenet-rest',
  socketUrl: 'wss://concenet-pre.sdos.es/concenet-rest/socket/',
  logLevel: NgxLoggerLevel.DEBUG
};

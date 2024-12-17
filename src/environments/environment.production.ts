import { Env } from '@app/types/env';
import { NgxLoggerLevel } from 'ngx-logger';

// eslint-disable-next-line prefer-const
export let environment: Env = {
  appVersion: `${require('../../package.json').version}`,
  production: true,
  socketsEnabled: false,
  apiBaseUrl: 'https://go.grupoconcesur.es/concenet-rest',
  socketUrl: 'wss://go.grupoconcesur.es/concenet-rest/socket/',
  logLevel: NgxLoggerLevel.ERROR
};

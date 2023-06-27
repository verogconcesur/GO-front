import { NgxLoggerLevel } from 'ngx-logger';

export type Env = {
  appVersion: string;
  production: boolean;
  socketsEnabled: boolean;
  apiBaseUrl: string;
  logLevel: NgxLoggerLevel;
  socketUrl: string;
};

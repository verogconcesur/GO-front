import { NgxLoggerLevel } from 'ngx-logger';

export type Env = {
  appVersion: string;
  production: boolean;
  apiBaseUrl: string;
  logLevel: NgxLoggerLevel;
};

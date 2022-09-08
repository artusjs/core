import { LoggerLevel } from './level';

export interface LoggerOptions {
  level?: LoggerLevel;
}

export interface LogOptions {
  level: LoggerLevel;
  message: string|Error;
  splat?: any[];
}

export interface LoggerType {
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string | Error, ...args: any[]): void;
  fatal(message: string | Error, ...args: any[]): void;

  log(opts: LogOptions): void;
}

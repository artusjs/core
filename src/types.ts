import { ExceptionHandler } from '.';
import { HookFunction } from './lifecycle';
import { Manifest } from './loader';
import { Trigger } from './trigger';

export interface Application {
  trigger: Trigger;
  exceptionHandler: ExceptionHandler;

  manifest?: Manifest;

  load(manifest: Manifest): Promise<Application>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;
}

export * from './loader/types';

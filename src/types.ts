import { Container } from '@artus/injection';
import { BaseContext } from '@artus/pipeline';
import { HookFunction } from './lifecycle';
import { Manifest } from './loader';
import { LoggerType } from './logger';

export interface ApplicationLifecycle {
  configWillLoad?: HookFunction;
  configDidLoad?: HookFunction;
  didLoad?: HookFunction;
  willReady?: HookFunction;
  didReady?: HookFunction;
  beforeClose?: HookFunction;
}

export interface ApplicationInitOptions {
  containerName?: string;
  env: string | string[];
}

export interface Application {
  container: Container;

  manifest?: Manifest;
  config?: Record<string, any>;

  // getter
  logger: LoggerType

  load(manifest: Manifest): Promise<this>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;
}

export interface TriggerType {
  use(...args): void | Promise<void>;
  initContext(...args): BaseContext | Promise<BaseContext>;
  startPipeline(...args): Promise<void>;
}

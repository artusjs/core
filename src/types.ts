import { Container } from '@artus/injection';
import { BaseContext } from '@artus/pipeline';
import { HookFunction } from './lifecycle';
import { Manifest } from './loader';

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
}

export interface Application {
  manifest?: Manifest;
  config?: Record<string, any>;

  get trigger(): TriggerType;

  load(manifest: Manifest): Promise<this>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;

  // 兜底方法，不建议使用
  getContainer(): Container;
}

export interface TriggerType {
  use(...args): Promise<void>;
  initContext(...args): Promise<BaseContext>;
  startPipeline(...args): Promise<BaseContext>;
}

export * from './loader/types';

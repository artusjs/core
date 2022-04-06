import { Constructable, Container } from '@artus/injection';
import { HookFunction } from './lifecycle';
import { Manifest } from './loader';
import { Trigger } from './trigger';

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
  trigger?: typeof Trigger;
  initClassList?: Constructable<unknown>[];
  hookClass?: Constructable<ApplicationLifecycle>; // TODO: Replace to lifecycle map
}

export interface Application extends Container {
  manifest?: Manifest;

  load(manifest: Manifest): Promise<this>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;
}

export * from './loader/types';

import { Container } from '@artus/injection';
import ConfigurationHandler, { ConfigObject } from './configuration';
import { HookFunction, LifecycleManager } from './lifecycle';
import { LoaderFactory, Manifest } from './loader';
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

  // getter
  config: ConfigObject;
  configurationHandler: ConfigurationHandler;
  lifecycleManager: LifecycleManager;
  loaderFactory: LoaderFactory;
  logger: LoggerType

  load(manifest: Manifest): Promise<this>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;
}


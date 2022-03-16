import { HookFunction } from './lifecycle';
import { Manifest } from './loader';

export interface Application {
  load(manifest: Manifest): Promise<Application>;
  run(): Promise<void>;
  registerHook(hookName: string, hookFn: HookFunction): void;
}

export * from './loader/types';

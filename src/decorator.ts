import { Injectable } from '@artus/injection';
import {
  HOOK_NAME_META_PREFIX,
  HOOK_FILE_LOADER,
} from './constant';

export function LifecycleHookUnit(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(HOOK_FILE_LOADER, { loader: 'lifecycle-hook-unit' }, target);
    Injectable({ lazy: true })(target);
  };
}

export function LifecycleHook(hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_NAME_META_PREFIX}${propertyKey}`, hookName ?? propertyKey, target.constructor);
  };
}

export * from './loader/decorator';

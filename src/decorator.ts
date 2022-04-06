import { HOOK_NAME_META_PREFIX } from './constraints';

export function ApplicationHook(hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_NAME_META_PREFIX}${propertyKey}`, hookName ?? propertyKey, target.constructor);
  };
};
import { Application } from './types';

export function ApplicationHook(app: Application, hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    const hookFn = target[propertyKey];
    app.registerHook(hookName ?? propertyKey, hookFn);
  };
};
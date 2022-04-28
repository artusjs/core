import { HOOK_CONFIG_HANDLE } from "../constraints";

export function DefineConfigHandle(handleName?: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_CONFIG_HANDLE}${handleName}`, propertyKey, target.constructor);
  };
};
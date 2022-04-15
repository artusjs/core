import {
  HOOK_CONSTRUCTOR_PARAMS,
  HOOK_CONSTRUCTOR_PARAMS_APP,
  HOOK_CONSTRUCTOR_PARAMS_CONTAINER,
  HOOK_NAME_META_PREFIX
} from './constraints';

export function ApplicationExtension(): ClassDecorator {
  return (_target: any) => {
    // Ready to remove?
  };
};

export function ApplicationHook(hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_NAME_META_PREFIX}${propertyKey}`, hookName ?? propertyKey, target.constructor);
  };
};

const WithApplicationExtensionConstructorParams = (tag: string): ParameterDecorator => {
  return (target: any, _propertyKey: string|symbol, parameterIndex: number) => {
    const paramsMd = Reflect.getOwnMetadata(HOOK_CONSTRUCTOR_PARAMS, target) ?? [];
    paramsMd[parameterIndex] = tag;
    Reflect.defineMetadata(HOOK_CONSTRUCTOR_PARAMS, paramsMd, target);
  };
}

export function WithApplication(): ParameterDecorator {
  return WithApplicationExtensionConstructorParams(HOOK_CONSTRUCTOR_PARAMS_APP);
}

export function WithContainer(): ParameterDecorator {
  return WithApplicationExtensionConstructorParams(HOOK_CONSTRUCTOR_PARAMS_CONTAINER);
}

export * from './loader/decorator';
export * from './trigger/decorator';

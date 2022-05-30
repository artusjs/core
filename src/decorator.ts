import {
  CONSTRUCTOR_PARAMS,
  CONSTRUCTOR_PARAMS_APP,
  CONSTRUCTOR_PARAMS_CONTAINER,
  HOOK_NAME_META_PREFIX,
  CONSTRUCTOR_PARAMS_CONTEXT,
  HOOK_FILE_LOADER,
} from './constant';

export function LifecycleHookUnit(): ClassDecorator {
  return (target: any) => {
    // Ready to remove?
    Reflect.defineMetadata(HOOK_FILE_LOADER, { loader: 'lifecycle-hook-unit' }, target);
  };
};

export function LifecycleHook(hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_NAME_META_PREFIX}${propertyKey}`, hookName ?? propertyKey, target.constructor);
  };
};

const WithConstructorParams = (tag: string): ParameterDecorator => {
  return (target: any, _propertyKey: string | symbol, parameterIndex: number) => {
    const paramsMd = Reflect.getOwnMetadata(CONSTRUCTOR_PARAMS, target) ?? [];
    paramsMd[parameterIndex] = tag;
    if (_propertyKey) {
      Reflect.defineMetadata(CONSTRUCTOR_PARAMS, paramsMd, target[_propertyKey]); // for proto
    } else {
      Reflect.defineMetadata(CONSTRUCTOR_PARAMS, paramsMd, target); // for constructor
    }
  };
}

export function WithApplication(): ParameterDecorator {
  return WithConstructorParams(CONSTRUCTOR_PARAMS_APP);
}

export function WithContainer(): ParameterDecorator {
  return WithConstructorParams(CONSTRUCTOR_PARAMS_CONTAINER);
}

export function WithContext(): ParameterDecorator {
  return WithConstructorParams(CONSTRUCTOR_PARAMS_CONTEXT);
}

export * from './loader/decorator';
export * from './trigger/decorator';

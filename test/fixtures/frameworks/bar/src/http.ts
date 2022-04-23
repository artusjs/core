import 'reflect-metadata';
import { Context, Next } from '@artus/pipeline';
import { Constructable } from '@artus/injection';
import { HOOK_CONSTRUCTOR_PARAMS, HOOK_PARAMS_CONTEXT } from '../../../../../src/constraints';
import { HttpTrigger } from '../../abstract/foo';
import { Injectable, ScopeEnum } from '@artus/injection';

export const enum HTTPMethodEnum {
  GET = 'GET',
  POST = 'POST',
  DELETE = ' DELETE',
  PUT = 'PUT',
};

export type ControllerParams = {
  path?: string
};

export type HttpParams = {
  method: HTTPMethodEnum,
  path: string
};

export type ControllerMeta = {
  prefix: string,
  clazz: Constructable
}

export const controllerMap = new Set<ControllerMeta>();

export const HOOK_HTTP_META_PREFIX = 'ARTUS#HOOK_HTTP_META_PREFIX::';

export function HttpController(options?: ControllerParams): ClassDecorator {
  const prefix = options?.path ?? '';
  return (target: any) => {
    controllerMap.add({ prefix, clazz: target });
  };
}

export function HttpMethod(options: HttpParams): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`http hookName is not support symbol [${propertyKey.description}]`);
    }
    Reflect.defineMetadata(`${HOOK_HTTP_META_PREFIX}${propertyKey}`, options, target.constructor);
    Injectable({ scope: ScopeEnum.EXECUTION })(target);
  };
}

export function registerController(trigger: HttpTrigger) {
  for (const controller of controllerMap) {
    const { prefix, clazz } = controller;
    const fnMetaKeys = Reflect.getMetadataKeys(clazz);

    for (let key of fnMetaKeys) {
      if (!key.startsWith(HOOK_HTTP_META_PREFIX)) {
        continue;
      }

      // register controller
      const { method, path } = Reflect.getMetadata(key, clazz);
      key = key.replace(HOOK_HTTP_META_PREFIX, '');

      // match router
      trigger.use(async (ctx: Context, next: Next) => {
        const { input: { params: { req } } } = ctx;
        if (req.url === `${prefix}${path}` && req.method === method) {
          const instance: any = ctx.container.get(clazz);
          const target = instance[key];
          const params: any = Reflect.getMetadata(HOOK_CONSTRUCTOR_PARAMS, target) ?? [];
          const paramsMap = {
            [HOOK_PARAMS_CONTEXT]: ctx
          };
          ctx.output.data.content = await target(...params.map((param) => paramsMap[param]));
        }
        await next();
      });
    }
  }
}

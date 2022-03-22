// import { Injectable } from '@artus/injection';
import { artusContainer, getArtusApplication } from '.';
import { HOOK_META_SYMBOL } from './constraints';
import { Application } from './types';

export function ApplicationHookClass(): ClassDecorator {
  return (target: any) => {
    // TODO: 待替换为 injection 提供的属性方法
    target.constructor.prototype.app = getArtusApplication();
    artusContainer.set({
      type: target
    });
  };
};

export function ApplicationHook(hookName?: string): PropertyDecorator {
  return (target: any, propertyKey: string|symbol) => {
    if (typeof propertyKey === 'symbol') {
      throw new Error(`hookName is not support symbol [${propertyKey.description}]`);
    }
    const app: Application = getArtusApplication();
    const hookFn = target[propertyKey];
    hookFn[HOOK_META_SYMBOL] = target.constructor;
    app.registerHook(hookName ?? propertyKey, hookFn);
  };
};
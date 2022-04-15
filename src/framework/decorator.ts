import { Injectable, ScopeEnum } from '@artus/injection';

export type FrameworkParams = {
  path: string
};
export function DefineFramework(options: FrameworkParams): ClassDecorator {
  console.log('framework path', options.path);
  return (target: any) => Injectable({
    scope: ScopeEnum.SINGLETON
  })(target);
};

import { Injectable, InjectableOption, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum } from '../constraints';

export const DefineLogger = (injectableOpts: InjectableOption = {}): ClassDecorator => {
  return Injectable({
    id: ArtusInjectEnum.Logger,
    scope: ScopeEnum.SINGLETON,
    ...injectableOpts
  });
};

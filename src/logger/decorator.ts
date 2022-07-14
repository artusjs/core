import { Injectable, InjectableOption, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum, SHOULD_OVERWRITE_VALUE } from '../constant';

export const DefineLogger = (injectableOpts: InjectableOption = {}): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata(SHOULD_OVERWRITE_VALUE, true, target);
    return Injectable({
      id: ArtusInjectEnum.Logger,
      scope: ScopeEnum.SINGLETON,
      ...injectableOpts,
    })(target);
  };
};

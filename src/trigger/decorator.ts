import { Injectable, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum, SHOULD_OVERWRITE_VALUE } from '../constant';

export function DefineTrigger(): ClassDecorator {
  return (target:any) => {
    Reflect.defineMetadata(SHOULD_OVERWRITE_VALUE, true, target);
    return Injectable({
      id: ArtusInjectEnum.Trigger,
      scope: ScopeEnum.SINGLETON,
    })(target);
  };
}

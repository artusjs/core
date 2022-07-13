import { Injectable, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum } from '../constant';

export function DefineTrigger(): ClassDecorator {
  return (target:any) => Injectable({
    id: ArtusInjectEnum.Trigger,
    scope: ScopeEnum.SINGLETON,
  })(target);
}

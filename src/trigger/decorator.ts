import { Injectable, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum } from '../constraints';

export function DefineTrigger(): ClassDecorator {
  return (target:any) => Injectable({
    id: ArtusInjectEnum.Trigger,
    scope: ScopeEnum.SINGLETON
  })(target);
};

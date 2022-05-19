import { Injectable, ScopeEnum } from '@artus/injection';
import { ArtusInjectEnum } from '../constraints';

export const DefineLogger = (): ClassDecorator => {
  return Injectable({
    id: ArtusInjectEnum.Logger,
    scope: ScopeEnum.SINGLETON
  });
};

import { Injectable, InjectableOption } from '@artus/injection';
import { ArtusInjectEnum } from '../constant';


export const DefineBootstrap = (injectableOpts?: InjectableOption): ClassDecorator => {
  return Injectable({
    ...injectableOpts,
    id: ArtusInjectEnum.Bootstrap,
  });
};

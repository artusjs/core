import { LoaderFactory } from './factory';
import { LoaderConstructor } from './types';

export const DefineLoader = (loaderName: string): ClassDecorator => 
  (target: Function) => {
    LoaderFactory.registerLoader(loaderName, target as unknown as LoaderConstructor);
  }
;

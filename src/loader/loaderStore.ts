import { LoaderConstructor } from '.';

const _loaderMap: Map<string, LoaderConstructor> = new Map();

export const DefineLoader = (loaderName: string): ClassDecorator => 
  (target: Function) => {
    _loaderMap.set(loaderName, target as unknown as LoaderConstructor);
  }
;

export const getLoaderClazz = (loaderName: string) => _loaderMap.get(loaderName);
import { LOADER_NAME_META } from '../constant';

export const DefineLoader = (loaderName: string): ClassDecorator => 
  (target: Function) => {
    Reflect.defineMetadata(LOADER_NAME_META, loaderName, target);
  }
;

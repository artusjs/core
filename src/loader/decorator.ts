import { LOADER_NAME_META } from '../constraints';

export const DefineLoader = (loaderName: string): ClassDecorator => 
  (target: Function) => {
    Reflect.defineMetadata(LOADER_NAME_META, loaderName, target);
  }
;

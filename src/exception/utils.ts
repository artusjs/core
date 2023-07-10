
import { Constructable, Container } from '@artus/injection';
import { EXCEPTION_FILTER_DEFAULT_SYMBOL, EXCEPTION_FILTER_MAP_INJECT_ID } from './constant';
import { ArtusStdError } from './impl';
import { ExceptionFilterMapType, ExceptionFilterType } from './types';
import { isClass } from '../utils/is';


export const matchExceptionFilterClazz =  (err: Error, container: Container): Constructable<ExceptionFilterType> | null => {
  const filterMap: ExceptionFilterMapType = container.get(EXCEPTION_FILTER_MAP_INJECT_ID, {
    noThrow: true,
  });
  if (!filterMap) {
    return null;
  }

  // handle ArtusStdError with code simply
  if (err instanceof ArtusStdError && filterMap.has(err.code)) {
    return filterMap.get(err.code);
  }
  
  // handle CustomErrorClazz, loop inherit class
  let errConstructor: Function = err['constructor'];
  while(isClass(errConstructor)) { // until parent/self is not class
    if (filterMap.has(errConstructor as Constructable<Error>)) {
      return filterMap.get(errConstructor as Constructable<Error>);
    }
    errConstructor = Object.getPrototypeOf(errConstructor); // get parent clazz by prototype
  }
  
  // handle default ExceptionFilter
  if (filterMap.has(EXCEPTION_FILTER_DEFAULT_SYMBOL)) {
    return filterMap.get(EXCEPTION_FILTER_DEFAULT_SYMBOL);
  }

  return null;
};

export const matchExceptionFilter = (err: Error, container: Container): ExceptionFilterType | null => {
  const filterClazz = matchExceptionFilterClazz(err, container);
  
  // return the instance of exception filter
  return filterClazz ? container.get(filterClazz) : null;
};

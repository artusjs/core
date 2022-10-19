
import { Constructable, Container } from '@artus/injection';
import { EXCEPTION_FILTER_DEFAULT_SYMBOL, EXCEPTION_FILTER_MAP_INJECT_ID } from './constant';
import { ArtusStdError } from './impl';
import { ExceptionFilterMapType, ExceptionFilterType } from './types';

export const matchExceptionFilter = (err: Error, container: Container): ExceptionFilterType | null => {
  const filterMap: ExceptionFilterMapType = container.get(EXCEPTION_FILTER_MAP_INJECT_ID, {
    noThrow: true,
  });
  if (!filterMap) {
    return null;
  }
  let targetFilterClazz: Constructable<ExceptionFilterType>;
  // handle ArtusStdError with code simply
  if (err instanceof ArtusStdError) {
    targetFilterClazz = filterMap.get(err.code);
  }
  if (!targetFilterClazz) {
    // handler other Exception by Clazz
    for (const errorClazz of filterMap.keys()) {
      if (typeof errorClazz === 'string' || typeof errorClazz === 'symbol') {
        continue;
      }
      if (err instanceof errorClazz) {
        targetFilterClazz = filterMap.get(errorClazz);
        break;
      }
    }
  }
  if (!targetFilterClazz && filterMap.has(EXCEPTION_FILTER_DEFAULT_SYMBOL)) {
    // handle default ExceptionFilter
    targetFilterClazz = filterMap.get(EXCEPTION_FILTER_DEFAULT_SYMBOL);
  }

  // return the instance of exception filter
  return targetFilterClazz ? container.get(targetFilterClazz) : null;
};

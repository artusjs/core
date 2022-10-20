
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
  if (err instanceof ArtusStdError) {
    // handle ArtusStdError with code simply
    targetFilterClazz = filterMap.get(err.code);
  } else if (filterMap.has(err['constructor'] as Constructable<Error>)) {
    // handle CustomErrorClazz
    targetFilterClazz = filterMap.get(err['constructor'] as Constructable<Error>);
  } else if (filterMap.has(EXCEPTION_FILTER_DEFAULT_SYMBOL)) {
    // handle default ExceptionFilter
    targetFilterClazz = filterMap.get(EXCEPTION_FILTER_DEFAULT_SYMBOL);
  }

  // return the instance of exception filter
  return targetFilterClazz ? container.get(targetFilterClazz) : null;
};

import { DefineLoader } from '../decorator';
import { ManifestItem } from '../types';
import ModuleLoader from './module';
import { ArtusStdError, EXCEPTION_FILTER_MAP_INJECT_ID, EXCEPTION_FILTER_METADATA_KEY } from '../../exception';
import { Constructable } from '@artus/injection';
import { ExceptionFilterType } from '../../exception/types';

@DefineLoader('exception_filter')
class ExceptionFilterLoader extends ModuleLoader {
  async load(item: ManifestItem) {
    // Get or Init Exception Filter Map
    let filterMap: Map<string|Constructable<Error>, Constructable<ExceptionFilterType>> = this.container.get(EXCEPTION_FILTER_MAP_INJECT_ID, {
      noThrow: true,
    });
    if (!filterMap) {
      filterMap = new Map();
      this.container.set({
        id: EXCEPTION_FILTER_MAP_INJECT_ID,
        value: filterMap,
      });
    }

    const clazzList = await super.load(item) as Constructable<ExceptionFilterType>[];
    for (let i = 0; i < clazzList.length; i++) {
      const filterClazz = clazzList[i];
      const filterMeta: {
        targetErr: string|Constructable<Error>
      } = Reflect.getOwnMetadata(EXCEPTION_FILTER_METADATA_KEY, filterClazz);

      /* istanbul ignore next */
      if (!filterMeta) {
        throw new Error(`invalid ExceptionFiler ${filterClazz.name}`);
      }

      let { targetErr } = filterMeta;
      if (filterMap.has(targetErr)) {
        // check duplicated
        const targetErrName = typeof targetErr === 'string' ? targetErr : (targetErr.name || targetErr);
        throw new Error(`the ExceptionFilter for ${targetErrName} is duplicated`);
      }

      if (
        typeof targetErr !== 'string' && // Decorate with a error class
        Object.prototype.isPrototypeOf.call(ArtusStdError.prototype, targetErr.prototype) && // the class extends ArtusStdError
        typeof targetErr['code'] === 'string' // Have static property `code` defined by string
      ) {
        // Custom Exception Class use Error Code for simplied match
        targetErr = targetErr['code'] as string;
      }

      filterMap.set(targetErr, filterClazz);
    }
    return clazzList;
  }
}

export default ExceptionFilterLoader;

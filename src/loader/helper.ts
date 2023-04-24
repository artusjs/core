import path from 'path';
import { isInjectable } from '@artus/injection';
import { LoaderFactory } from './factory';
import {
  LoaderFindOptions,
  LoaderFindResult,
} from './types';
import { ScanPolicy, HOOK_FILE_LOADER, DEFAULT_LOADER } from '../constant';
import compatibleRequire from '../utils/compatible_require';
import { isClass } from '../utils/is';

const findLoaderName = async (opts: LoaderFindOptions): Promise<{ loader: string | null, exportNames: string[] }> => {
  // Use Loader.is to find loader
  for (const [loaderName, LoaderClazz] of LoaderFactory.loaderClazzMap.entries()) {
    if (await LoaderClazz.is?.(opts)) {
      return { loader: loaderName, exportNames: [] };
    }
  }
  const { root, filename, policy = ScanPolicy.All } = opts;

  // require file for find loader
  const allExport = await compatibleRequire(path.join(root, filename), true);
  const exportNames: string[] = [];

  let loaders = Object.entries(allExport)
    .map(([name, targetClazz]) => {
      if (!isClass(targetClazz)) {
        // The file is not export with default class
        return null;
      }

      if (policy === ScanPolicy.NamedExport && name === 'default') {
        return null;
      }

      if (policy === ScanPolicy.DefaultExport && name !== 'default') {
        return null;
      }

      // get loader from reflect metadata
      const loaderMd = Reflect.getMetadata(HOOK_FILE_LOADER, targetClazz);
      if (loaderMd?.loader) {
        exportNames.push(name);
        return loaderMd.loader;
      }

      // default loder with @Injectable
      const injectableMd = isInjectable(targetClazz);
      if (injectableMd) {
        exportNames.push(name);
        return DEFAULT_LOADER;
      }
    })
    .filter(v => v);

  loaders = Array.from(new Set(loaders));

  if (loaders.length > 1) {
    throw new Error(`Not support multiple loaders for ${path.join(root, filename)}`);
  }

  return { loader: loaders[0] ?? null, exportNames };
};

export const findLoader = async (opts: LoaderFindOptions): Promise<LoaderFindResult | null> => {
  const { loader: loaderName, exportNames } = await findLoaderName(opts);

  if (!loaderName) {
    return null;
  }

  const loaderClazz = LoaderFactory.loaderClazzMap.get(loaderName);
  if (!loaderClazz) {
    throw new Error(`Cannot find loader '${loaderName}'`);
  }
  const result: LoaderFindResult = {
    loaderName,
    loaderState: { exportNames },
  };
  if (loaderClazz.onFind) {
    result.loaderState = await loaderClazz.onFind(opts);
  }
  return result;
};


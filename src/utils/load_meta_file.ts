import { ManifestItem } from '../loader/types';
import compatibleRequire from './compatible_require';

export const loadMetaFile = async <T = Record<string, any>>(item: ManifestItem): Promise<T> => {
  if (item.extname !== '.json') {
    throw new Error(`[loadMetaFile] ${item.path} is not a json file.`);
  }
  const metaObject = await compatibleRequire(item.path);
  if (!metaObject) {
    throw new Error(`[loadMetaFile] ${item.path} is not a valid json file.`);
  }
  return metaObject;
};

import compatibleRequire from './compatible_require';

export const loadMetaFile = async <T = Record<string, any>>(path: string): Promise<T> => {
  const metaObject = await compatibleRequire(path);
  if (!metaObject || typeof metaObject !== 'object') {
    throw new Error(`[loadMetaFile] ${path} is not a valid json file.`);
  }
  return metaObject;
};

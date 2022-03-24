import deepmerge from 'deepmerge';
import is from './is';

export function mergeConfig(...args) {
  /* istanbul ignore next */
  return deepmerge.all(args, {
    arrayMerge: (_, src) => src,
    clone: false,
    isMergeableObject: is.plainObject,
  });
}

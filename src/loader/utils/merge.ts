import deepmerge from 'deepmerge';
import { isPlainObject } from '../../utils/is';

export function mergeConfig(...args) {
  /* istanbul ignore next */
  return deepmerge.all(args, {
    arrayMerge: (_, src) => src,
    clone: false,
    isMergeableObject: isPlainObject,
  });
}

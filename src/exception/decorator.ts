import { Constructable, Injectable } from '@artus/injection';
import { HOOK_FILE_LOADER } from '../constant';
import { EXCEPTION_FILTER_DEFAULT_SYMBOL, EXCEPTION_FILTER_METADATA_KEY } from './constant';

export const Catch = (targetErr?: string|Constructable<Error>): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(EXCEPTION_FILTER_METADATA_KEY, {
      targetErr: targetErr ?? EXCEPTION_FILTER_DEFAULT_SYMBOL,
    }, target);
    Reflect.defineMetadata(HOOK_FILE_LOADER, { loader: 'exception_filter' }, target);
    Injectable()(target);
  };
};
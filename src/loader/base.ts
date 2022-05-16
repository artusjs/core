import { Loader, ManifestItem } from './types';

export default class BaseLoader implements Loader {
  async load(_item: ManifestItem) {
    throw new Error('Not implemented');
  }
}

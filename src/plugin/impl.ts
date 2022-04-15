import compatibleRequire from '../loader/utils/compatible-require';
import { BasePlugin } from './base';

export class ArtusPlugin extends BasePlugin {
  async init() {
    if (!this.enable) {
      return;
    }
    try {
      const metaPath = this.manifest.pluginMeta?.path ?? '';
      if (!metaPath) {
        throw new Error('Plugin metadata file is not defined at manifest');
      }
      this.metadata = await compatibleRequire(metaPath);
    } catch (error) {
      throw new Error(`${this.name} is not have a metadata file`);
    }
    if (this.metadata.name !== this.name) {
      throw new Error(`${this.name} metadata invalid, name is ${this.metadata.name}`);
    }
  }
}

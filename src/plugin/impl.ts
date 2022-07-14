import path from 'path';
import { BasePlugin } from './base';
import { loadMetaFile } from '../utils/load_meta_file';
import { exisis } from '../utils/fs';
import { PLUGIN_META_FILENAME } from '../constant';

export class ArtusPlugin extends BasePlugin {
  async init() {
    if (!this.enable) {
      return;
    }
    await this.checkAndLoadMetadata();
    if (!this.metadata) {
      throw new Error(`${this.name} is not have metadata.`);
    }
    if (this.metadata.name !== this.name) {
      throw new Error(`${this.name} metadata invalid, name is ${this.metadata.name}`);
    }
  }

  private async checkAndLoadMetadata() {
    // check import path
    if (!await exisis(this.importPath)) {
      throw new Error(`load plugin <${this.name}> import path ${this.importPath} is not exists.`);
    }
    const metaFilePath = path.resolve(this.importPath, PLUGIN_META_FILENAME);
    try {
      if (!await exisis(metaFilePath)) {
        throw new Error(`load plugin <${this.name}> import path ${this.importPath} can't find meta file.`);
      }
      this.metadata = await loadMetaFile({
        path: metaFilePath,
        extname: path.extname(metaFilePath),
        filename: PLUGIN_META_FILENAME,
      });
      this.metaFilePath = metaFilePath;
    } catch (e) {
      throw new Error(`load plugin <${this.name}> failed, err: ${e}`);
    }
  }
}

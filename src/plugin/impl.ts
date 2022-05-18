import path from 'path';
import { BasePlugin } from './base';
import { loadMetaFile } from '../utils/load_meta_file';
import { exisis } from '../utils/fs';

export class ArtusPlugin extends BasePlugin {
  async init() {
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

    let find = false;
    const fileNameList = [
      'meta.yaml',
      'meta.yml',
      'meta.json',
    ];
    for (const fileName of fileNameList) {
      const metaFilePath = path.resolve(this.importPath, fileName);
      try {
        if (!await exisis(metaFilePath)) {
          continue;
        }
        this.metadata = await loadMetaFile({
          path: metaFilePath,
          extname: path.extname(metaFilePath),
          filename: fileName,
        });
        this.metaFilePath = metaFilePath;
        find = true;
        break;
      } catch (e) {
        throw new Error(`load plugin <${this.name}> failed, err: ${e}`);
      }
    }

    if (!find) {
      throw new Error(`load plugin <${this.name}> import path ${this.importPath} can't find meta file.`);
    }
  }
}

import path from 'path';
import { BasePlugin } from './base';
import { loadMetaFile } from '../utils/load-meta-file';

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
    const fileNameList = [
      'meta.yaml',
      'meta.yml',
      'meta.json',
    ];
    for (const fileName of fileNameList) {
      const metaFilePath = path.resolve(this.importPath, fileName);
      try {
        this.metadata = await loadMetaFile({
          path: metaFilePath,
          extname: path.extname(metaFilePath),
          filename: fileName,
        });
        this.metaFilePath = metaFilePath;
        break;
      } catch(e) {
        // 单个文件找不到或者不合法，继续找下一个
      }
    }
  }
}

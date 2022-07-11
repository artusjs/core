import path from 'path';
import ConfigurationHandler, { ConfigObject } from '../configuration';
import { ManifestItem } from '../types';
import { exisis } from '../utils/fs';
import { loadMetaFile } from '../utils/load_meta_file';
export interface FrameworkConfig {
  path?: string,
  package?: string
}

export class FrameworkHandler {
  static async mergeConfig(env: string, frameworks: ManifestItem[], done: string[]): Promise<{ config: ConfigObject, done: string[] }> {
    frameworks = frameworks.filter(item => !done.includes(item.path));
    const frameworkConfigHandler = new ConfigurationHandler();
    for (const frameworkConfigFile of frameworks) {
      await frameworkConfigHandler.setConfigByFile(frameworkConfigFile);
    }

    done = done.concat(frameworks.map(item => item.path));

    return { config: frameworkConfigHandler.getMergedConfig(env), done };
  }

  static async handle(root: string, config: FrameworkConfig): Promise<string> {
    // no framework
    if (!config.path && !config.package) {
      return '';
    }

    try {
      let baseFrameworkPath = config.path ?? path.dirname(require.resolve(config.package ?? '', { paths: [root] }));
      return baseFrameworkPath;
    } catch (err) {
      throw new Error(`load framework faild: ${err}, framework config: ${JSON.stringify(config)}`);
    }
  }
  static async checkAndLoadMetadata(frameworkDir: string){
    // check import path
    if (!await exisis(frameworkDir)) {
      throw new Error(`load framework import path ${frameworkDir} is not exists.`);
    }

    let find = false;
    const fileNameList = [
      'meta.yaml',
      'meta.yml',
      'meta.json',
    ];
    let metadata;
    for (const fileName of fileNameList) {
      const metaFilePath = path.resolve(frameworkDir, fileName);
      try {
        if (!await exisis(metaFilePath)) {
          continue;
        }
        metadata = await loadMetaFile({
          path: metaFilePath,
          extname: path.extname(metaFilePath),
          filename: fileName,
        });
        find = true;
        break;
      } catch (e) {
        throw new Error(`load framework metadata <${frameworkDir}> failed, err: ${e}`);
      }
    }

    if (!find) {
      throw new Error(`load framework import path ${frameworkDir} can't find meta file.`);
    }
  }
}

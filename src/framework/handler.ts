import path from 'path';
import ConfigurationHandler, { ConfigObject } from '../configuration';
import { ManifestItem } from '../types';

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
}

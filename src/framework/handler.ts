import path from 'path';
import { ManifestItem } from "../types";

interface FrameworkConfig {
  path?: string,
  package?: string
}

export class FrameworkHandler {
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

  static serialize(list: ManifestItem[]): string[] {
    return list.map(item => item.path);
  }
}

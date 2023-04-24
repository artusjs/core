import path from 'path';
import { writeFile } from 'fs/promises';
import { DEFAULT_CONFIG_DIR, DEFAULT_EXCLUDES, DEFAULT_MANIFEST_FILENAME, DEFAULT_MODULE_EXTENSIONS, ScanPolicy } from '../constant';
import { ManifestV2 } from '../loader';
import { ScannerOptions, ScanContext, ScannerType, ScanTaskItem } from './types';
import { runTask } from './task';

export class ArtusScanner implements ScannerType {
  private options: ScannerOptions;

  constructor(options: Partial<ScannerOptions> = {}) {
    this.options = {
      appName: '_app',
      needWriteFile: true,
      useRelativePath: true,
      configDir: DEFAULT_CONFIG_DIR,
      policy: ScanPolicy.All,
      ...options,
      exclude: DEFAULT_EXCLUDES.concat(options.exclude ?? []),
      extensions: DEFAULT_MODULE_EXTENSIONS.concat(options.extensions ?? []),
    };
  }

  /**
  * The entrance of Scanner
  */
  async scan(root: string): Promise<ManifestV2> {
    // make sure the root path is absolute
    if (!path.isAbsolute(root)) {
      root = path.resolve(root);
    }

    // Init scan-task queue with a root task
    const taskQueue: ScanTaskItem[] = [{
      root,
      subPath: '.',
      refName: this.options.appName,
    }];

    // Init scan-task context
    const scanCtx: ScanContext = {
      taskQueue,
      refMap: {},
      pluginConfigMap: {},
      options: this.options,
    };

    // Run task queue
    while (taskQueue.length > 0) {
      const taskSlice = taskQueue
        .splice(0, taskQueue.length)
        .map(taskItem => runTask(taskItem, scanCtx));
      await Promise.all(taskSlice);
    }

    // Dump manifest
    const manifestResult: ManifestV2 = {
      version: '2',
      pluginConfig: scanCtx.pluginConfigMap,
      refMap: scanCtx.refMap,
      relative: this.options.useRelativePath,
    };
    if (this.options.needWriteFile) {
      const manifestFilePath = path.resolve(root, DEFAULT_MANIFEST_FILENAME);
      await writeFile(
        manifestFilePath,
        JSON.stringify(manifestResult, null, 2),
      );
    }
    return manifestResult;
  }
}

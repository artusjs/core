import path from 'path';
import { writeFile } from 'fs/promises';
import { DEFAULT_APP_REF, DEFAULT_CONFIG_DIR, DEFAULT_EXCLUDES, DEFAULT_MANIFEST_FILENAME, DEFAULT_MODULE_EXTENSIONS, ScanPolicy } from '../constant';
import { Manifest } from '../loader';
import { ScannerOptions, ScanContext, ScannerType, ScanTaskItem } from './types';
import { handlePluginConfig, runTask } from './task';
import { ArtusApplication } from '../application';

export class ArtusScanner implements ScannerType {
  private options: ScannerOptions;

  constructor(options: Partial<ScannerOptions> = {}) {
    this.options = {
      needWriteFile: true,
      manifestFilePath: DEFAULT_MANIFEST_FILENAME,
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
  async scan(root: string): Promise<Manifest> {
    // make sure the root path is absolute
    if (!path.isAbsolute(root)) {
      root = path.resolve(root);
    }

    // Init scan-task queue with a root task
    const taskQueue: ScanTaskItem[] = [{
      curPath: '.',
      refName: DEFAULT_APP_REF,
    }];

    // Init scan-task context
    const scanCtx: ScanContext = {
      root,
      taskQueue,
      refMap: {},
      pluginConfigMap: {},
      options: this.options,
      app: this.options.app ?? new ArtusApplication(),
    };

    // Add Task of options.plugin
    if (this.options.plugin) {
      await handlePluginConfig(this.options.plugin, '.', scanCtx);
    }

    // Run task queue
    while (taskQueue.length > 0) {
      const taskItem = taskQueue.shift();
      await runTask(taskItem, scanCtx);
    }

    // Dump manifest
    const manifestResult: Manifest = {
      version: '2',
      pluginConfig: scanCtx.pluginConfigMap,
      refMap: scanCtx.refMap,
      relative: this.options.useRelativePath,
    };
    if (this.options.needWriteFile) {
      let { manifestFilePath } = this.options;
      if (!path.isAbsolute(manifestFilePath)) {
        manifestFilePath = path.resolve(root, manifestFilePath);
      }
      await writeFile(
        manifestFilePath,
        JSON.stringify(manifestResult, null, 2),
      );
    }
    return manifestResult;
  }
}

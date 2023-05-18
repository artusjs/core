import path from 'path';
import { writeFile } from 'fs/promises';
import { DEFAULT_CONFIG_DIR, DEFAULT_EXCLUDES, DEFAULT_MANIFEST_FILENAME, DEFAULT_MODULE_EXTENSIONS, ScanPolicy } from '../constant';
import { Manifest } from '../loader';
import { ScannerOptions, ScannerType } from './types';
import { ScanTaskRunner } from './task';

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

    // Init scan-task scanner
    const taskRunner = new ScanTaskRunner(
      root,
      this.options,
    );

    // Start scan
    await taskRunner.runAll();

    // Dump manifest
    const manifestResult: Manifest = taskRunner.dump();
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

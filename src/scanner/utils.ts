import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Container } from '@artus/injection';
import {
  ArtusInjectEnum,
  DEFAULT_LOADER,
  PLUGIN_META,
} from '../constant';
import { LoaderFactory, ManifestItem } from '../loader';
import { WalkOptions } from './types';
import { isMatch } from '../utils';

export class ScanUtils {
  static loaderFactory: LoaderFactory = LoaderFactory.create(new Container(ArtusInjectEnum.DefaultContainerName));

  static async walk(root: string, options: WalkOptions) {
    const { source, unitName, baseDir, configDir } = options;
    if (!existsSync(root)) {
      // TODO: use artus logger instead
      console.warn(`[scan->walk] ${root} is not exists.`);
      return;
    }

    const stat = await fs.stat(root);
    if (!stat.isDirectory()) {
      return;
    }

    const items = await fs.readdir(root);
    for (const item of items) {
      const realPath = path.resolve(root, item);
      const extname = path.extname(realPath);
      if (this.isExclude(item, extname, options.exclude, options.extensions)) {
        continue;
      }
      const itemStat = await fs.stat(realPath);
      if (itemStat.isDirectory()) {
        // ignore plugin dir
        // TODO:  怎么判断是否是插件文件夹
        if (this.exist(realPath, PLUGIN_META)) {
          continue;
        }
        await ScanUtils.walk(realPath, options);
        continue;
      }

      if (itemStat.isFile()) {
        const filename = path.basename(realPath);
        const filenameWithoutExt = path.basename(realPath, extname);
        const {
          loaderName,
          loaderState,
        } = await ScanUtils.loaderFactory.findLoader({
          filename,
          root,
          baseDir,
          configDir,
        });
        const item: ManifestItem = {
          path: options.extensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
          extname,
          filename,
          loader: loaderName,
          source,
        };
        if (loaderState) {
          item._loaderState = loaderState;
        }
        unitName && (item.unitName = unitName);
        const itemList = options.itemMap.get(item.loader ?? DEFAULT_LOADER);
        if (Array.isArray(itemList)) {
          itemList.push(item);
        }
      }
    }
  }

  static isExclude(filename: string, extname: string,
    exclude: string[], extensions: string[]): boolean {
    let result = false;
    if (!result && exclude) {
      result = isMatch(filename, exclude);
    }

    if (!result && extname) {
      result = !extensions.includes(extname);
    }
    return result;
  }

  static exist(dir: string, filenames: string[]): boolean {
    return filenames.some(filename => {
      return existsSync(path.resolve(dir, `${filename}`));
    });
  }
}
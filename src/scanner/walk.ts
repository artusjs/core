import 'reflect-metadata';
import * as path from 'path';
import *  as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Container } from '@artus/injection';
import {
  ArtusInjectEnum,
  DEFAULT_LOADER,
  PLUGIN_META
} from "../constraints";
import { LoaderFactory, ManifestItem } from "../loader";
import { WalkOptions } from "./types";
import { isMatch } from '../utils';

export default class Walk {
  private options: WalkOptions;
  private loaderFactory: LoaderFactory;

  constructor(options: WalkOptions) {
    this.options = options;
    this.loaderFactory = LoaderFactory.create(new Container(ArtusInjectEnum.DefaultContainerName));
  }


  async start(root: string) {
    const { source, unitName, baseDir, configDir } = this.options;
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
      if (this.isExclude(item, extname)) {
        continue;
      }
      const itemStat = await fs.stat(realPath);
      if (itemStat.isDirectory()) {
        // ignore plugin dir
        // TODO:  怎么判断是否是插件文件夹
        if (this.exist(realPath, PLUGIN_META)) {
          continue;
        }
        await this.start(realPath);
        continue;
      }

      if (itemStat.isFile()) {
        const filename = path.basename(realPath);
        const filenameWithoutExt = path.basename(realPath, extname);
        const item: ManifestItem = {
          path: this.options.extensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
          extname,
          filename,
          loader: await this.loaderFactory.getLoaderName({
            filename,
            root,
            baseDir,
            configDir
          }),
          source
        };
        unitName && (item.unitName = unitName);
        const itemList = this.options.itemMap.get(item.loader ?? DEFAULT_LOADER);
        if (Array.isArray(itemList)) {
          itemList.push(item);
        }
      }
    }
  }

  private isExclude(filename: string, extname: string): boolean {
    let result = false;
    const { excluded } = this.options;
    if (!result && excluded) {
      result = isMatch(filename, excluded);
    }

    if (!result && extname) {
      result = !this.options.extensions.includes(extname);
    }
    return result;
  }

  private exist(dir: string, filenames: string[]): boolean {
    return filenames.some(filename => {
      return existsSync(path.resolve(dir, `${filename}`));
    });
  }
}
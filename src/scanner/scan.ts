import 'reflect-metadata';
import *  as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { getDefaultExtensions, isMatch } from '../utils';
import {
    DEFAULT_EXCLUDES,
    PLUGIN_META,
    DEFAULT_LOADER_LIST_WITH_ORDER,
    DEFAULT_LOADER,
    DEFAULT_CONFIG_DIR,
    ARTUS_DEFAULT_CONFIG_ENV,
    ArtusInjectEnum,
    LOADER_NAME_META,
} from '../constraints';
import {
    ScannerOptions,
    WalkOptions,
} from './types';
import { LoaderFactory, Manifest, ManifestItem } from '../loader';
import ConfigurationHandler from '../configuration';
import { PluginFactory } from '../plugin';
import { FrameworkHandler } from '../framework';
import { Container } from '@artus/injection';

export class Scanner {
    private options: ScannerOptions;
    private moduleExtensions: string[];
    private itemMap: Map<string, ManifestItem[]>;
    private loaderFactory: LoaderFactory;

    constructor(options: Partial<ScannerOptions> = {}) {
        this.moduleExtensions = getDefaultExtensions();
        this.options = {
            appName: 'app',
            needWriteFile: true,
            configDir: DEFAULT_CONFIG_DIR,
            loaderListGenerator: (defaultLoaderList: string[]) => defaultLoaderList,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: [...new Set(this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']))],
        };

        this.checkOptions();

        this.itemMap = new Map(
          this.options.loaderListGenerator(DEFAULT_LOADER_LIST_WITH_ORDER)
            .map((loaderNameOrClazz) => {
              if(typeof loaderNameOrClazz === 'string') {
                return [loaderNameOrClazz, []];
              }
              const loaderClazz = loaderNameOrClazz;
              const loaderName = Reflect.getMetadata(LOADER_NAME_META, loaderClazz);
              if (!loaderName) {
                throw new Error(`Loader ${loaderClazz.name} must have a @DefineLoader() decorator.`);
              }
              return [loaderName, []];
            })
        );
        this.loaderFactory = LoaderFactory.create(new Container(ArtusInjectEnum.DefaultContainerName));
    }

    private checkOptions() {
        if (!this.options.configDir) {
            throw new Error(`config dir must be passed in.`);
        }
    }

    private async scanEnvList(root: string): Promise<string[]> {
        const { configDir, envs } = this.options;
        if (Array.isArray(envs) && envs.length) {
          return envs;
        }
        const configFileList = await fs.readdir(path.resolve(root, configDir));
        const envSet: Set<string> = new Set([ARTUS_DEFAULT_CONFIG_ENV.DEFAULT]);
        for (const configFilename of configFileList) {
            if(configFilename.endsWith('.d.ts')){
              continue;
            }
          const env = ConfigurationHandler.getEnvFromFilename(configFilename);
          envSet.add(env);
        }
        return [...envSet];
    }

    public async scan(root: string): Promise<Record<string, Manifest>> {
        const result = {};
        const envList = await this.scanEnvList(root);
        for (const env of envList) {
            result[env] = await this.scanItems(root, env);
        }
        if (this.options.needWriteFile) {
            this.writeFile(`manifest.json`, JSON.stringify(result, null, 2));
        }
        return result;
    }

    private async scanItems(root: string, env: string) {
        // 0. Scan Application
        await this.walk(root, { source: 'app', baseDir: root, configDir: this.options.configDir });

        // 1. Scan Frameworks
        await this.recurseFramework(env, root, []);

        // 2. Calculate Plugin Load Order (need scan after framework because of plugin config maybe in framework)
        const pluginConfigHandler = new ConfigurationHandler();
        for (const pluginConfigFile of this.itemMap.get('plugin-config') ?? []) {
            await pluginConfigHandler.setConfigByFile(pluginConfigFile);
        }
        const mergedConfig = pluginConfigHandler.getMergedConfig(env);
        const pluginSortedList = await PluginFactory.createFromConfig(mergedConfig || {});
        for (const plugin of pluginSortedList.reverse()) {
            const metaList = this.itemMap.get('plugin-meta') ?? [];
            if (!plugin.enable) {
                continue;
            }
            metaList.push({
                path: plugin.metaFilePath,
                extname: path.extname(plugin.metaFilePath),
                filename: path.basename(plugin.metaFilePath),
                loader: 'plugin-meta',
                source: 'plugin',
                unitName: plugin.name,
            });
            await this.walk(plugin.importPath, {
                source: 'plugin',
                baseDir: plugin.importPath,
                unitName: plugin.name,
                configDir: plugin.metadata.configDir ?? this.options.configDir
            });
        }

        const result: Manifest = {
            items: this.getItemsFromMap(),
        };
        return result;
    }

    private async recurseFramework(env: string, frameworkBaseDir: string, executed: string[]) {
        const { config, done } =
            await FrameworkHandler.mergeConfig(env, this.itemMap.get('framework-config') ?? [], executed);
        const baseFrameworkPath = await FrameworkHandler.handle(frameworkBaseDir, config);
        if (!baseFrameworkPath) {
            return;
        }
        await this.walk(baseFrameworkPath, {
            source: 'framework',
            baseDir: baseFrameworkPath,
            unitName: baseFrameworkPath,
            configDir: this.options.configDir
        });

        await this.recurseFramework(env, baseFrameworkPath, executed.concat(done));
    }

    private async walk(
        root: string,
        options: WalkOptions) {
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
                await this.walk(realPath, { source, unitName, baseDir, configDir });
                continue;
            }

            if (itemStat.isFile()) {
                const filename = path.basename(realPath);
                const filenameWithoutExt = path.basename(realPath, extname);
                const item: ManifestItem = {
                    path: this.moduleExtensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
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
                const itemList = this.itemMap.get(item.loader ?? DEFAULT_LOADER);
                if (Array.isArray(itemList)) {
                    itemList.unshift(item);
                }
            }
        }
    }

    private getItemsFromMap(): ManifestItem[] {
        let items: ManifestItem[] = [];
        for (const [, unitItems] of this.itemMap) {
            items = items.concat(unitItems);
        }
        const apps = items.filter(item => item.source === 'app');
        const plugins = items.filter(item => item.source === 'plugin');
        const frameworks = items.filter(item => item.source === 'framework');
        return frameworks.concat(plugins).concat(apps);
    }

    /**
     * ignore excluded match and extensions not match
     * @param {string} filename 
     * @param {string} extname 
     * @returns {Boolean}
     */
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

    private async writeFile(filename: string = 'manifest.json', data: string) {
        await fs.writeFile(filename, data);
    }
}

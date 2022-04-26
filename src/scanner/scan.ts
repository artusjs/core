import 'reflect-metadata';
import *  as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { getDefaultExtensions, isMatch } from '../utils';
import compatibleRequire from '../utils/compatible-require';
import {
    CONFIG_PATTERN,
    DEFAULT_EXCLUDES,
    PLUGIN_CONFIG_PATTERN,
    PLUGIN_META,
    EXCEPTION_FILE,
    FRAMEWORK_PATTERN,
    PACKAGE_JSON,
    DEFAULT_LOADER_LIST_WITH_ORDER,
    DEFAULT_LOADER,
    HOOK_FILE_LOADER,
    DEFAULT_CONFIG_DIR,
} from '../constraints';
import {
    ScannerOptions,
    WalkOptions,
    LoaderOptions,
} from './types';
import { Manifest, ManifestItem } from '../loader';
import { BasePlugin, PluginFactory } from '../plugin';
import { FrameworkHandler } from '../framework';
import { PluginConfigItem } from '../plugin/types';

export class Scanner {
    private options: ScannerOptions;
    private moduleExtensions: string[];
    private itemMap: Map<string, ManifestItem[]>;

    constructor(options: Partial<ScannerOptions> = {}) {
        this.moduleExtensions = getDefaultExtensions();
        this.options = {
            appName: 'app',
            needWriteFile: true,
            conifgDir: DEFAULT_CONFIG_DIR,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: [...new Set(this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']))],
        };

        this.checkOptions();

        this.itemMap = new Map(DEFAULT_LOADER_LIST_WITH_ORDER.map((loaderName) => ([loaderName, []])));
    }

    private checkOptions() {
        if (!this.options.conifgDir) {
            throw new Error(`config dir must be passed in.`);
        }
    }

    public async scan(root: string) {
        // 0. Scan Application
        await this.walk(root, { source: 'app', baseDir: root });

        // 1. Calculate Plugin Load Order
        let pluginSortedList: BasePlugin[] = [];
        for (const pluginConfigFile of this.itemMap.get('plugin-config') ?? []) {
            const pluginConfig: Record<string, PluginConfigItem> = await compatibleRequire(pluginConfigFile.path);
            const realConfig = {};
            for (const [name, config] of Object.entries(pluginConfig)) {
                if (!config.path && !config.package) {
                    continue;
                }
                realConfig[name] = config;
            }
            pluginSortedList.push(...await PluginFactory.createFromConfig(realConfig));

        }
        pluginSortedList = PluginFactory.filterDuplicatePlugins(pluginSortedList);
        for (const plugin of pluginSortedList.reverse()) {
            const metaList = this.itemMap.get('plugin-meta') ?? [];
            metaList.push({
                path: plugin.metaFilePath,
                extname: path.extname(plugin.metaFilePath),
                filename: path.basename(plugin.metaFilePath),
                loader: 'plugin-meta',
                source: 'plugin',
                unitName: plugin.name,
            });
            await this.walk(plugin.importPath, { source: 'plugin', baseDir: plugin.importPath, unitName: plugin.name });
        }

        // 2. Scan Frameworks
        const serialize = FrameworkHandler.serialize;
        const frameworks: string[] = [];
        const frameworkMap = new Map<string, boolean>();
        frameworks.push(...serialize(this.itemMap.get('framework-config') ?? []));
        frameworks.push(...serialize(this.itemMap.get('package-json') ?? []));
        await this.recurseFramework(frameworks, root, frameworkMap);

        const result: Manifest = {
            items: this.getItemsFromMap(),
        };
        if (this.options.needWriteFile) {
            this.writeFile('manifest.json', JSON.stringify(result, null, 2));
        }
        return result;
    }

    private async recurseFramework(frameworks: string[], frameworkBaseDir: string, frameworkMap: Map<string, boolean>) {
        const serialize = FrameworkHandler.serialize;
        for (const frame of frameworks) {
            if (frameworkMap.get(frame)) {
                continue;
            } frameworkMap.set(frame, true);
            const frameworkConfig = await compatibleRequire(frame);
            frameworkConfig.framework && (frameworkConfig.package = frameworkConfig.framework);
            const baseFrameworkPath = await FrameworkHandler.handle(frameworkBaseDir, frameworkConfig);
            baseFrameworkPath && await this.walk(baseFrameworkPath, {
                source: 'framework',
                baseDir: baseFrameworkPath,
                unitName: baseFrameworkPath
            });
            await this.recurseFramework([
                ...serialize(this.itemMap.get('framework-config') ?? []),
                ...serialize(this.itemMap.get('package-json') ?? [])
            ], baseFrameworkPath, frameworkMap);
        }
    }

    private async walk(
        root: string,
        { source, unitName, baseDir }: WalkOptions = {
            source: '',
            unitName: this.options.appName,
            baseDir: ''
        }) {
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
                await this.walk(realPath, { source, unitName, baseDir });
                continue;
            }

            if (itemStat.isFile()) {
                const filename = path.basename(realPath);
                const filenameWithoutExt = path.basename(realPath, extname);
                const item: ManifestItem = {
                    path: this.moduleExtensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
                    extname,
                    filename,
                    loader: await this.getLoaderName(filename, { root, baseDir }),
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
        return items;
    }

    private isConfigDir(baseDir: string, currentDir: string): boolean {
        const { conifgDir } = this.options;
        return path.join(baseDir, conifgDir) === currentDir;
    }

    private async getLoaderName(filename: string, { root, baseDir }: LoaderOptions): Promise<string> {
        // package.json
        if (this.isPakcageJson(filename)) {
            return 'package-json';
        }

        // artus-exception.yaml
        if (this.isException(filename)) {
            return 'exception';
        }

        // config dir
        if (this.isConfigDir(baseDir, root)) {
            if (this.isConfig(filename)) {
                return 'config';
            } else if (this.isPluginConfig(filename)) {
                return 'plugin-config';
            } else if (this.isFrameworkConfig(filename)) {
                return 'framework-config';
            }
        }

        // get loader from reflect metadata
        const target = await compatibleRequire(path.join(root, filename));
        const metadata = Reflect.getMetadata(HOOK_FILE_LOADER, target);
        if (metadata?.loader) {
            return metadata.loader;
        }

        // default loder
        return 'module';
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

    // TODO: 怎么判断是否是配置文件
    private isConfig(filename: string): boolean {
        return isMatch(filename, CONFIG_PATTERN)
    }

    // TODO: 怎么判断是否是插件配置文件
    private isPluginConfig(filename: string): boolean {
        return isMatch(filename, PLUGIN_CONFIG_PATTERN);
    }

    // TODO:
    private isException(filename: string): boolean {
        return isMatch(filename, EXCEPTION_FILE);
    }

    // TODO:
    private isFrameworkConfig(filename: string): boolean {
        return isMatch(filename, FRAMEWORK_PATTERN);
    }

    private isPakcageJson(filename: string): boolean {
        return isMatch(filename, PACKAGE_JSON);
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

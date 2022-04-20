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
    EXTENSION_PATTERN,
    FRAMEWORK_PATTERN,
    PACKAGE_JSON,
    DEFAULT_LOADER_LIST_WITH_ORDER,
    DEFAULT_LOADER
} from '../constraints';
import {
    ScannerOptions,
} from './types';
import { Manifest, ManifestItem } from '../loader';
import ConfigurationHandler from '../configuration';
import { PluginFactory } from '../plugin';
import { FrameworkHandler } from '../framework';

export class Scanner {
    private options: ScannerOptions;
    private moduleExtensions: string[];
    private itemMap: Map<string, ManifestItem[]>;

    constructor(options: Partial<ScannerOptions> = {}) {
        this.moduleExtensions = getDefaultExtensions();
        this.options = {
            appName: 'app',
            needWriteFile: true,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']),
        };
        this.itemMap = new Map(DEFAULT_LOADER_LIST_WITH_ORDER.map((loaderName) => ([loaderName, []])));
    }

    public async scan(root: string) {
        // 0. Scan Application
        await this.walk(root, 'app');

        // 1. Calculate Plugin Load Order
        const pluginConfigHandler = new ConfigurationHandler();
        for (const pluginConfigFile of this.itemMap.get('plugin-config') ?? []) {
            const pluginConfig = await compatibleRequire(pluginConfigFile.path);
            if (pluginConfig) {
                let [_, env, extname] = pluginConfigFile.filename.split('.');
                if (!extname) {
                    env = 'default';
                }
                pluginConfigHandler.setConfig(env, pluginConfig);
            }
        }
        const mergedConfig = await pluginConfigHandler.getMergedConfig();
        const pluginSortedList = await PluginFactory.createFromConfig(mergedConfig || {});
        for (const plugin of pluginSortedList.reverse()) {
            const metaList = this.itemMap.get('plugin-meta') ?? [];
            metaList.push({
                path: plugin.metaFilePath,
                extname: path.extname(plugin.metaFilePath),
                filename: path.basename(plugin.metaFilePath),
                loader: 'plugin-meta',
                source: 'plugin'
            });
            await this.walk(plugin.importPath, 'plugin');
        }

        // 2. Scan Frameworks
        const serialize = FrameworkHandler.serialize;
        const frameworkMap = new Map<string, boolean>();
        const frameworks: string[] = [];
        frameworks.push(...serialize(this.itemMap.get('framework') ?? []));
        frameworks.push(...serialize(this.itemMap.get('package-json') ?? []));
        let frameworkBaseDir = root;
        for (const frame of frameworks) {
            if (frameworkMap.get(frame)) {
                continue;
            }
            frameworkMap.set(frame, true);
            const frameworkConfig = await compatibleRequire(frame);
            frameworkConfig.framework && (frameworkConfig.package = frameworkConfig.framework);
            const baseFrameworkPath = await FrameworkHandler.handle(frameworkBaseDir, frameworkConfig);
            baseFrameworkPath && (frameworkBaseDir = baseFrameworkPath) && await this.walk(baseFrameworkPath, 'framework');
            frameworks.push(...serialize(this.itemMap.get('framework') ?? []));
            frameworks.push(...serialize(this.itemMap.get('package-json') ?? []));
        }

        const result: Manifest = {
            items: this.getItemsFromMap(),
        };
        if (this.options.needWriteFile) {
            this.writeFile('manifest.json', JSON.stringify(result, null, 2));
        }
        return result;
    }

    private async walk(root: string, unitName: string) {
        if (!existsSync(root)) {
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
                await this.walk(realPath, unitName);
                continue;
            }

            if (itemStat.isFile()) {
                const filename = path.basename(realPath);
                const filenameWithoutExt = path.basename(realPath, extname);
                const item: ManifestItem = {
                    path: this.moduleExtensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
                    extname,
                    filename,
                    loader: this.getLoaderName(filename),
                    source: unitName
                };
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

    private getLoaderName(filename: string): string {
        // TODO: 后面考虑重构通过参数传递匹配规则
        if (this.isConfig(filename)) {
            return 'config';
        } else if (this.isPluginConfig(filename)) {
            return 'plugin-config';
        } else if (this.isException(filename)) {
            return 'exception';
        } else if (this.isExtension(filename)) {
            return 'extension';
        } else if (this.isFramework(filename)) {
            return 'framework';
        } else if (this.isPakcageJson(filename)) {
            return 'package-json';
        } else {
            return 'module';
        }
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
    private isExtension(filename: string): boolean {
        return isMatch(filename, EXTENSION_PATTERN);
    }

    // TODO:
    private isFramework(filename: string): boolean {
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

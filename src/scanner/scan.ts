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
    PACKAGE_JSON,
    EXCEPTION_FILE,
    EXTENSION_PATTERN
} from '../constraints';
import {
    ScannerOptions,
    ScannerItem,
    ScannerUnit,
    ScannerManifest
} from './types';
import { PluginConfigItem } from '../plugin/types';

export class Scanner {
    private options: ScannerOptions;
    private moduleExtensions: string[];
    constructor(options: Partial<ScannerOptions> = {}) {
        this.moduleExtensions = getDefaultExtensions();
        this.options = {
            appName: 'app',
            needWriteFile: true,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']),
        };
    }

    public async scan(root: string) {
        const manifest: ScannerManifest = {};
        await this.scanUnit(this.options.appName!, root, manifest);
        const { [this.options.appName]: app, ...others } = manifest;
        const result = { app, plugins: {} };
        Object.keys(others).forEach(name => {
            result.plugins[name] = others[name];
        });
        if (this.options.needWriteFile) {
            this.writeFile('manifest.json', JSON.stringify(result, null, 2));
        }
        return result;
    }

    private async scanUnit(appName: string, root: string, manifest: ScannerManifest) {
        const result = await this.walk(root);
        const packageJson = this.getPackageJson(root);
        const pluginMeta = this.getPluginMeta(root);
        manifest[appName] = {
            packageJson: packageJson ? { path: packageJson, extname: '.json', filename: PACKAGE_JSON } : undefined,
            pluginMeta: pluginMeta ? { ...pluginMeta, filename: `${PLUGIN_META}${pluginMeta.extname}` } : undefined,
            items: this.filterArray(result.items),
            config: this.filterArray(result.config),
            pluginConfig: this.filterArray(result.pluginConfig),
            exception: this.filterArray(result.exception),
            extension: this.filterArray(result.extension),
        };

        for (const pluginItem of result.pluginConfig) {
            const pluginConfig: Record<string, PluginConfigItem> = await compatibleRequire(pluginItem.path);
            if (!pluginConfig) {
                continue;
            }
            for (const [name, plugin] of Object.entries(pluginConfig)) {
                if (!manifest[name]) {
                    let pluginPath = plugin.path ?? '';
                    if (plugin.package) {
                        pluginPath = require.resolve(plugin.package);
                    }
                    await this.scanUnit(name, pluginPath, manifest);
                }
            }
        }
    }

    private async walk(root: string) {
        const result: ScannerUnit = {
            items: [],
            config: [],
            pluginConfig: [],
            exception: [],
            extension: [],
        };
        if (!existsSync(root)) {
            return result;
        }

        const stat = await fs.stat(root);
        if (!stat.isDirectory()) {
            return result;
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
                const subDir = await this.walk(realPath);
                result.items = result.items.concat(subDir.items);
                result.config = result.config.concat(subDir.config);
                result.pluginConfig = result.pluginConfig.concat(subDir.pluginConfig);
                result.exception = result.exception.concat(subDir.exception);
                result.extension = result.extension.concat(subDir.extension);
                continue;
            }

            if (itemStat.isFile()) {
                const filename = path.basename(realPath);
                const filenameWithoutExt = path.basename(realPath, extname);
                const item: ScannerItem = {
                    path: this.moduleExtensions.includes(extname) ? path.resolve(root, filenameWithoutExt) : realPath,
                    extname,
                    filename,
                };

                // TODO: 后面考虑重构通过参数传递匹配规则
                switch (true) {
                    case this.isConfig(filename):
                        result.config.push(item)
                        break;
                    case this.isPluginConfig(filename):
                        result.pluginConfig.push(item);
                        break;
                    case this.isException(filename):
                        result.exception.push(item);
                        break;
                    case this.isExtension(filename):
                        result.extension.push(item);
                        break;
                    default: result.items.push(item);
                }
            }
        }
        return result;
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
    private isExtension(filename: string,): boolean {
        return isMatch(filename, EXTENSION_PATTERN);
    }

    private getPackageJson(dir: string) {
        if (existsSync(path.resolve(dir, PACKAGE_JSON))) {
            return path.resolve(dir, PACKAGE_JSON);
        }
        return undefined;
    }

    private getPluginMeta(dir: string) {
        const extname = this.options.extensions.find(ext => {
            return existsSync(path.resolve(dir, `${PLUGIN_META}${ext}`));
        });
        return extname ? { path: path.resolve(dir, PLUGIN_META), extname } : undefined;
    }

    private filterArray<T = any>(arr: T[]) {
        if (!Array.isArray(arr) || !arr.length) {
            return undefined;
        }
        return arr;
    }

    private exist(dir: string, filename: string): boolean {
        return this.options.extensions.some(ext => {
            return existsSync(path.resolve(dir, `${filename}${ext}`));
        });
    }

    private async writeFile(filename: string = 'manifest.json', data: string) {
        await fs.writeFile(filename, data);
    }
}
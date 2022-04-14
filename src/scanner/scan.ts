import *  as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { getDefaultExtensions, isMatch } from '../utils';
import compatibleRequire from '../utils/compatible-require';
import { CONFIG_PATTERN, DEFAULT_EXCLUDES, PLUGIN_CONFIG_PATTERN, PLUGIN_META, PACKAGE_JSON } from '../constraints';
import { ScannerOptions, ScannerItem, ScannerManifest } from './types';

export class Scanner {
    private options: ScannerOptions;
    private moduleExtensions: string[];
    constructor(options: Partial<ScannerOptions> = {}) {
        this.options = {
            appName: 'app',
            needWriteFile: true,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: getDefaultExtensions().concat(options.extensions ?? []),
        };
        this.moduleExtensions = getDefaultExtensions();
    }

    public async scan(root: string) {
        const manifest: ScannerManifest = {};
        await this.scanApp(this.options.appName!, root, manifest);
        if (this.options.needWriteFile) {
            this.writeFile('manifest.json', JSON.stringify(manifest, null, 2));
        }
        return manifest;
    }

    private async scanApp(appName: string, root: string, manifest: ScannerManifest) {
        const result = await this.walk(root);
        manifest[appName] = {
            items: result.items,
            packageJson: this.getPackageJson(root),
            pluginMeta: this.getPluginMeta(root),
            config: result.config.length ? result.config : undefined,
            pluginConfig: result.pluginConfig.length ? result.pluginConfig : undefined,
        };

        for (const pluginItem of result.pluginConfig) {
            const pluginConfig = compatibleRequire(pluginItem.path);
            if (!Array.isArray(pluginConfig)) {
                continue;
            }
            for (const plugin of pluginConfig) {
                if (!manifest[plugin.name]) {
                    let pluginPath = plugin.path;
                    if (plugin.package) {
                        pluginPath = require.resolve(plugin.package);
                    }
                    await this.scanApp(plugin.name, pluginPath, manifest);
                }
            }
        }
    }

    private async walk(root: string) {
        const result: { items: ScannerItem[], config: ScannerItem[], pluginConfig: ScannerItem[] } = {
            items: [],
            config: [],
            pluginConfig: []
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
                // ignore plugin config
                // TODO:  怎么判断是否是插件配置文件
                if (this.exist(realPath, PLUGIN_META)) {
                    continue;
                }
                const subDir = await this.walk(realPath);
                result.items = result.items.concat(subDir.items);
                result.config = result.config.concat(subDir.config);
                result.pluginConfig = result.pluginConfig.concat(subDir.pluginConfig);
                continue;
            }

            if (itemStat.isFile()) {
                const filename = path.basename(realPath);
                const filenameWithoutExt = path.basename(realPath, extname);
                const item = {
                    path: path.resolve(root, filenameWithoutExt),
                    extname,
                    filename,
                    filenameWithoutExt,
                    loader: this.moduleExtensions.includes(extname) ? 'module' : 'file'
                };

                if (this.isConfig(filename)) {
                    result.config.push(item)
                } else if (this.isPluginConfig(filename)) {
                    result.pluginConfig.push(item);
                } else {
                    result.items.push(item);
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

    private getPackageJson(dir: string) {
        if (existsSync(path.resolve(dir, PACKAGE_JSON))) {
            return path.resolve(dir, PACKAGE_JSON);
        }
        return undefined;
    }

    private getPluginMeta(dir: string) {
        if (this.exist(dir, PLUGIN_META)) {
            return path.resolve(dir, PLUGIN_META);
        }
        return undefined;
    }

    private exist(dir: string, filename: string) {
        return this.options.extensions.some(ext => {
            return existsSync(path.resolve(dir, `${filename}${ext}`));
        });
    }

    private async writeFile(filename: string = 'manifest.json', data: string) {
        await fs.writeFile(filename, data);
    }
}
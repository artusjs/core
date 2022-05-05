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
    ScanOptions,
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
            configDir: DEFAULT_CONFIG_DIR,
            ...options,
            excluded: DEFAULT_EXCLUDES.concat(options.excluded ?? []),
            extensions: [...new Set(this.moduleExtensions.concat(options.extensions ?? [], ['.yaml']))],
        };

        this.checkOptions();

        this.itemMap = new Map(DEFAULT_LOADER_LIST_WITH_ORDER.map((loaderName) => ([loaderName, []])));
    }

    private checkOptions() {
        if (!this.options.configDir) {
            throw new Error(`config dir must be passed in.`);
        }
    }

    public async scan(root: string, options: ScanOptions = { env: ['default'] }): Promise<Record<string, Manifest>> {
        const result = {};
        for (const enviro of options.env) {
            result[enviro] = await this.scanItems(root, enviro);
        }
        return result;
    }

    private async scanItems(root: string, env: string) {
        // 0. Scan Application
        await this.walk(root, { source: 'app', baseDir: root });

        // 1. Scan Frameworks
        await this.recurseFramework(env, root, []);

        // 2. Calculate Plugin Load Order (need scan after framework because of plugin config maybe in framework)
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
            await this.walk(plugin.importPath, { source: 'plugin', baseDir: plugin.importPath, unitName: plugin.name });
        }

        const result: Manifest = {
            items: this.getItemsFromMap(),
        };
        if (this.options.needWriteFile) {
            this.writeFile(`manifest.${env}.json`, JSON.stringify(result, null, 2));
        }
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
            unitName: baseFrameworkPath
        });

        this.recurseFramework(env, baseFrameworkPath, executed.concat(done));
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
        const apps = items.filter(item => item.source === 'app');
        const plugins = items.filter(item => item.source === 'plugin');
        const frameworks = items.filter(item => item.source === 'framework');
        return frameworks.concat(plugins).concat(apps);
    }

    private isConfigDir(baseDir: string, currentDir: string): boolean {
        const { configDir } = this.options;
        return path.join(baseDir, configDir) === currentDir;
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

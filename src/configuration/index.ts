import { Injectable } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constraints';
import { mergeConfig } from '../loader/utils/merge';
import { BasePlugin, PluginFactory } from '../plugin';
import { DefineConfigHandle } from './decorator';

export type ConfigObject = Record<string, any>;
export type PackageObject = ConfigObject;
export type EnvUnit = { path: string, choose?: string, ignore?: EnvUnit[] };
export type FrameworkOptions = { env: string, unitName: string };

@Injectable()
export default class ConfigurationHandler {
  private configStore: Map<string, ConfigObject> = new Map();
  private frameworks: Map<string, EnvUnit[]> = new Map();
  private packages: Map<string, PackageObject[]> = new Map();

  getMergedConfig(env?: string): ConfigObject {
    const currentEnv = env ?? process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV;
    const defaultConfig = this.configStore.get(ARTUS_DEFAULT_CONFIG_ENV.DEFAULT) ?? {};
    const envConfig = this.configStore.get(currentEnv) ?? {};
    return mergeConfig(defaultConfig, envConfig);
  }

  setConfig(env: string, config: ConfigObject) {
    const storedConfig = this.configStore.get(env) ?? {};
    this.configStore.set(env, mergeConfig(storedConfig, config));
  }

  @DefineConfigHandle('plugin-config')
  async getPluginConfig(env?: string): Promise<Map<string, EnvUnit>> {
    const currentEnv = env ?? process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV;
    const mergedConfig = this.getMergedConfig(currentEnv)?.plugin;
    const pluginSortedList = await PluginFactory.createFromConfig(mergedConfig || {});

    // get all plugins
    const allPlugins: BasePlugin[] = [];
    for (const rawEnv of this.configStore.keys()) {
      const { plugin: pluginConfig } = this.configStore.get(rawEnv) ?? {};
      if (!pluginConfig) {
        continue;
      }

      const validPluginConfig = {};
      for (const [name, config] of Object.entries(pluginConfig)) {
        if (!BasePlugin.checkGetPluginConfig(name, config as any, false)) {
          continue;
        }
        validPluginConfig[name] = config;
      }
      allPlugins.push(...await PluginFactory.createFromConfig(validPluginConfig))
    }

    const pluginMap = new Map<string, EnvUnit>();
    for (const plugin of pluginSortedList) {
      const unit: EnvUnit = { path: plugin.importPath, choose: currentEnv, ignore: [] };

      // ignore disabled
      if (!plugin.enable) {
        unit.ignore?.push(unit);
      }

      // ignore others
      const list = allPlugins
        .filter(plg => plg.name === plugin.name)
        .filter(plg => plg.importPath !== plugin.importPath)
        .map(plg => ({ path: plg.importPath }));
      unit.ignore?.push(...list);

      pluginMap.set(plugin.name, unit);
    }

    return pluginMap;
  }

  @DefineConfigHandle('framework-config')
  async getFrameworkConfig(
    env?: string,
    key = 'app',
    frameworkMap = new Map<string, EnvUnit>()): Promise<Map<string, EnvUnit>> {
    if (!this.frameworks.has(key)) {
      return frameworkMap;
    }
    const currentEnv = env ?? process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV;
    const list = this.frameworks.get(key) as unknown as EnvUnit[];
    const envList = list.filter(item => item.choose === currentEnv);
    const defaultList = list.filter(item => item.choose === ARTUS_DEFAULT_CONFIG_ENV.DEFAULT);
    const result = envList.length ? envList[0] : defaultList.length ? defaultList[0] : undefined;
    if (!result) {
      return frameworkMap;
    }
    result.ignore = list.filter(item => item.path !== result.path);
    frameworkMap.set(key, result);
    this.getFrameworkConfig(currentEnv, result?.path, frameworkMap);
    return frameworkMap;
  }

  addFramework(source: string, framework: EnvUnit, options: FrameworkOptions) {
    const key = options.unitName || source;
    const list = this.frameworks.get(key) ?? [];
    framework.choose = options.env;
    list.push(framework);
    this.frameworks.set(key, list);
  }

  getPackages(): Map<string, PackageObject[]> {
    return this.packages;
  }

  addPackage(source: string, pkg: PackageObject) {
    const list = this.packages.get(source) ?? [];
    list.push(pkg);
    this.packages.set(source, list);
  }
}

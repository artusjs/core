import { Injectable } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constant';
import { ManifestItem } from '../loader';
import { mergeConfig } from '../loader/utils/merge';
import compatibleRequire from '../utils/compatible_require';
import { DefineConfigHandle } from './decorator';

export type ConfigObject = Record<string, any>;
export type FrameworkObject = { path: string, env: string };
export type PackageObject = ConfigObject;
export type FrameworkOptions = { env: string, unitName: string };

@Injectable()
export default class ConfigurationHandler {
  static getEnvFromFilename(filename: string): string {
    let [_, env, extname] = filename.split('.');
    if (!extname) {
        env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    return env;
  }

  private configStore: Map<string, ConfigObject> = new Map();
  private frameworks: Map<string, FrameworkObject[]> = new Map();
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

  async setConfigByFile(fileItem: ManifestItem) {
    const configContent: ConfigObject = await compatibleRequire(fileItem.path);
    if (configContent) {
      const env = ConfigurationHandler.getEnvFromFilename(fileItem.filename);
      this.setConfig(env, configContent);
    }
  }

  @DefineConfigHandle('framework-config')
  getFrameworkConfig(
    env?: string,
    key = 'app',
    frameworkMap = new Map<string, FrameworkObject>()): Map<string, FrameworkObject> {
    if (!this.frameworks.has(key)) {
      return frameworkMap;
    }
    const currentEnv = env ?? process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV;
    const list = this.frameworks.get(key) as unknown as FrameworkObject[];
    const defaultConfig = list.filter(item => item.env === ARTUS_DEFAULT_CONFIG_ENV.DEFAULT)[0] ?? {};
    const envConfig = list.filter(item => item.env === currentEnv)[0] ?? {};
    const config = mergeConfig(defaultConfig, envConfig) as unknown as FrameworkObject;
    frameworkMap.set(key, config);

    if (config.path) {
      this.getFrameworkConfig(env, config.path, frameworkMap);
    }
    return frameworkMap;
  }

  addFramework(source: string, framework: FrameworkObject, options: FrameworkOptions) {
    const key = options.unitName || source;
    const list = this.frameworks.get(key) ?? [];
    framework.env = options.env;
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

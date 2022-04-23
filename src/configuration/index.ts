import { Injectable } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constraints';
import { mergeConfig } from '../loader/utils/merge';

export type ConfigObject = Record<string, any>;
export type PackageObject = ConfigObject;
export type Framework = { path: string, choose: string, drop?: Framework[] };
export type FrameworkOptions = { env: string, unitName: string };

@Injectable()
export default class ConfigurationHandler {
  private configStore: Map<string, ConfigObject> = new Map();
  private frameworks: Map<string, Framework[]> = new Map();
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

  getFrameworks(
    env?: string,
    key = 'app',
    frameworkMap = new Map<string, Framework>()): Map<string, Framework> {
    if (!this.frameworks.has(key)) {
      return frameworkMap;
    }
    const currentEnv = env ?? process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV;
    const list = this.frameworks.get(key) as unknown as Framework[];
    const envList = list.filter(item => item.choose === currentEnv);
    const defaultList = list.filter(item => item.choose === ARTUS_DEFAULT_CONFIG_ENV.DEFAULT);
    const result = envList.length ? envList[0] : defaultList.length ? defaultList[0] : undefined;
    if (!result) {
      return frameworkMap;
    }
    result.drop = list.filter(item => item.path !== result.path);
    frameworkMap.set(key, result);
    this.getFrameworks(currentEnv, result?.path, frameworkMap);
    return frameworkMap;
  }

  addFramework(source: string, framework: Framework, options: FrameworkOptions) {
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

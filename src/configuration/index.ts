import { Injectable } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constraints';
import { mergeConfig } from '../loader/utils/merge';

type ConfigObject = Record<string, any>;
type PackageObject = ConfigObject;
type Framework = { path: string };

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

  getFrameworks(): Map<string, Framework[]> {
    return this.frameworks;
  }

  addFramework(source: string, framework: Framework) {
    const list = this.frameworks.get(source) ?? [];
    list.push(framework);
    this.frameworks.set(source, list);
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

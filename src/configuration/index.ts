import { Container, Inject, Injectable } from '@artus/injection';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constant';
import { ManifestItem } from '../loader';
import { mergeConfig } from '../loader/utils/merge';
import compatibleRequire from '../utils/compatible_require';

export type ConfigObject = Record<string, any>;
export type PackageObject = ConfigObject;

@Injectable()
export default class ConfigurationHandler {
  static getEnvFromFilename(filename: string): string {
    let [_, env, extname] = filename.split('.');
    if (!extname) {
      env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    return env;
  }

  public configStore: Record<string, ConfigObject> = {};

  @Inject()
  private container: Container;

  getMergedConfig(): ConfigObject {
    return this.mergeConfigByStore(this.configStore);
  }

  mergeConfigByStore(store: Record<string, ConfigObject>): ConfigObject {
    let envList: string[] = this.container.get(ArtusInjectEnum.EnvList, { noThrow: true });
    if (!envList) {
      envList = process.env[ARTUS_SERVER_ENV] ? [process.env[ARTUS_SERVER_ENV]] : [ARTUS_DEFAULT_CONFIG_ENV.DEV];
    }
    const defaultConfig = store[ARTUS_DEFAULT_CONFIG_ENV.DEFAULT] ?? {};
    const envConfigList = envList.map(currentEnv => (store[currentEnv] ?? {}));
    return mergeConfig(defaultConfig, ...envConfigList);
  }

  clearStore(): void {
    this.configStore = {};
  }

  setConfig(env: string, config: ConfigObject) {
    const storedConfig = this.configStore[env] ?? {};
    this.configStore[env] = mergeConfig(storedConfig, config);
  }

  async setConfigByFile(fileItem: ManifestItem) {
    const configContent: ConfigObject = await compatibleRequire(fileItem.path + fileItem.extname);
    if (configContent) {
      const env = ConfigurationHandler.getEnvFromFilename(fileItem.filename);
      this.setConfig(env, configContent);
    }
  }
}

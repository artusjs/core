import { Container, Inject, Injectable } from '@artus/injection';
import { ArtusInjectEnum, ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constant';
import { ManifestItem } from '../loader';
import { mergeConfig } from '../loader/utils/merge';
import compatibleRequire from '../utils/compatible_require';

export type ConfigObject = Record<string, any>;
export type FrameworkObject = { path: string; env: string };
export type PackageObject = ConfigObject;
export type FrameworkOptions = { env: string; unitName: string };

@Injectable()
export default class ConfigurationHandler {
  static getEnvFromFilename(filename: string): string {
    let [_, env, extname] = filename.split('.');
    if (!extname) {
      env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
    }
    return env;
  }

  public configStore: Map<string, ConfigObject> = new Map();

  @Inject()
  private container: Container;

  getMergedConfig(): ConfigObject {
    let envList: string[] = this.container.get(ArtusInjectEnum.EnvList, { noThrow: true });
    if (!envList) {
      envList = process.env[ARTUS_SERVER_ENV] ? [process.env[ARTUS_SERVER_ENV]] : [ARTUS_DEFAULT_CONFIG_ENV.DEV];
    }
    const defaultConfig = this.configStore.get(ARTUS_DEFAULT_CONFIG_ENV.DEFAULT) ?? {};
    const envConfigList = envList.map(currentEnv => (this.configStore.get(currentEnv) ?? {}));
    return mergeConfig(defaultConfig, ...envConfigList);
  }

  clearStore(): void {
    this.configStore.clear();
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
}

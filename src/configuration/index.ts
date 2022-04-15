import { Injectable } from '@artus/injection';
import { ARTUS_DEFAULT_CONFIG_ENV, ARTUS_SERVER_ENV } from '../constraints';
import { mergeConfig } from '../loader/utils/merge';

type ConfigObject = Record<string, any>;

@Injectable()
export default class ConfigurationHandler {
  private configStore: Map<string, ConfigObject> = new Map();

  getMergedConfig(): ConfigObject {
    const defaultConfig = this.configStore.get(ARTUS_DEFAULT_CONFIG_ENV.DEFAULT) ?? {};
    const envConfig = this.configStore.get(process.env[ARTUS_SERVER_ENV] ?? ARTUS_DEFAULT_CONFIG_ENV.DEV) ?? {};
    return mergeConfig(defaultConfig, envConfig);
  }

  setConfig(env: string, config: ConfigObject) {
    const storedConfig = this.configStore.get(env) ?? {};
    this.configStore.set(env, mergeConfig(storedConfig, config));
  }
}

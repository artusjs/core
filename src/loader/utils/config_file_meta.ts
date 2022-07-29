import { ARTUS_DEFAULT_CONFIG_ENV } from '../../constant';

export interface ConfigFileMeta {
  env: string;
  namespace?: string;
}

export const getConfigMetaFromFilename = (filename: string): ConfigFileMeta => {
  let [namespace, env, extname] = filename.split('.');
  if (!extname) {
    // No env flag, set to Default
    env = ARTUS_DEFAULT_CONFIG_ENV.DEFAULT;
  }
  const meta: ConfigFileMeta = {
    env,
  };
  if (namespace !== 'config') {
    meta.namespace = namespace;
  }
  return meta;
};

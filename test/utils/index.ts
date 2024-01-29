import 'reflect-metadata';
import os from 'os';
import { ArtusScanner, ArtusApplication, Manifest, RefMap, PluginConfig } from '../../src';

export const DEFAULT_EMPTY_MANIFEST: Manifest = {
  version: '2',
  refMap: {},
};

export async function createApp(baseDir: string) {
  const scanner = new ArtusScanner({
    needWriteFile: false,
    configDir: 'config',
    extensions: ['.ts'],
  });
  const manifest = await scanner.scan(baseDir);

  const app = new ArtusApplication();
  await app.load(manifest, baseDir);
  await app.run();

  return app;
}

export function formatManifestForWindowsTest(manifest: Manifest) {
  if (os.platform() !== 'win32') {
    return manifest;
  }
  // A regexp for convert win32 path delimiter to POSIX style
  const pathReg = /\\/g;
  const newRefMap: RefMap = {};
  const handlePluginConfig = (pluginConfig: PluginConfig) => {
    return Object.fromEntries(Object.entries(pluginConfig).map(([pluginName, pluginConfigItem]) => {
      if (pluginConfigItem.refName) {
        pluginConfigItem.refName = pluginConfigItem.refName.replace(pathReg, '/');
      }
      return [pluginName, pluginConfigItem];
    }));
  };
  for (const [refName, refItem] of Object.entries(manifest.refMap)) {
    for (const pluginConfig of Object.values(refItem.pluginConfig)) {
      for (const pluginConfigItem of Object.values(pluginConfig)) {
        if (!pluginConfigItem.refName) {
          continue;
        }
        pluginConfigItem.refName = pluginConfigItem.refName.replace(pathReg, '/');
      }
    }
    newRefMap[refName.replace(pathReg, '/')] = {
      ...refItem,
      relativedPath: refItem.relativedPath.replace(pathReg, '/'),
      items: refItem.items.map(item => ({
        ...item,
        path: item.path.replace(pathReg, '/'),
      })),
      pluginConfig: Object.fromEntries(Object.entries(refItem.pluginConfig).map(
        ([env, pluginConfig]) => [env, handlePluginConfig(pluginConfig)],
      )),
    };
  }
  manifest.refMap = newRefMap;
  manifest.extraPluginConfig = handlePluginConfig(manifest.extraPluginConfig);
  return manifest;
}

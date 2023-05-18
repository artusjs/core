import 'reflect-metadata';
import os from 'os';
import { ArtusScanner, ArtusApplication, Manifest, RefMap } from '../../src';

export const DEFAULT_EMPTY_MANIFEST: Manifest = {
  version: '2',
  pluginConfig: {},
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
  for (const pluginConfig of Object.values(manifest.pluginConfig)) {
    for (const pluginConfigItem of Object.values(pluginConfig)) {
      if (!pluginConfigItem.refName) {
        continue;
      }
      pluginConfigItem.refName = pluginConfigItem.refName.replace(pathReg, '/');
    }
  }
  const newRefMap: RefMap = {};
  for (const [refName, refItem] of Object.entries(manifest.refMap)) {
    newRefMap[refName.replace(pathReg, '/')] = {
      ...refItem,
      relativedPath: refItem.relativedPath.replace(pathReg, '/'),
      items: refItem.items.map(item => ({
        ...item,
        path: item.path.replace(pathReg, '/'),
      })),
    };
  }
  manifest.refMap = newRefMap;
  return manifest;
}

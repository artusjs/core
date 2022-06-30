import { Scanner, ArtusApplication } from '../../../src/index';

export async function createApp() {
  const baseDir = __dirname;
  const scanner = new Scanner({
    needWriteFile: false,
    configDir: 'config',
    extensions: ['.ts'],
  });
  const manifest = await scanner.scan(baseDir);

  const app = new ArtusApplication();
  await app.load(manifest.default, baseDir);
  await app.run();

  return app;
}

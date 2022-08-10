import 'reflect-metadata';
import { Scanner, ArtusApplication } from '../../src';

export async function createApp(baseDir: string) {
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

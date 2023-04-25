import 'reflect-metadata';
import { ArtusScanner, ArtusApplication } from '../../src';

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

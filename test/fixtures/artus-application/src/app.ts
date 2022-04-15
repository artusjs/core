import { FrameworkBar } from '../../frameworks/bar/src';
import { readdir } from 'fs/promises';
import path from 'path';

class MyArtusApplication extends FrameworkBar {
  async scanDir(dir) {
    const files = await readdir(dir);
    for (const file of files) {
      super.loadFile(path.join(dir, file));
    }
  }

  async loadFile() {
    const controller = path.join(__dirname, 'controller');
    await this.scanDir(controller);

    const config = path.join(__dirname, 'config');
    await this.scanDir(config);
  }
}

export async function main() {
  const app = new MyArtusApplication();
  await app.loadFile();
  await app.run();
  return app;
}

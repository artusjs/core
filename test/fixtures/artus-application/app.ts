import { FrameworkBar } from '../frameworks/bar';
import { readdir } from 'fs/promises';
import path from 'path';

class MyArtusApplication extends FrameworkBar {
  async loadFile() {
    const controller = path.join(__dirname, './src/controller');
    const files = await readdir(controller);
    for (const file of files) {
      super.loadFile(path.join(controller, file));
    }
  }
}

export async function main() {
  const app = new MyArtusApplication();
  await app.loadFile();
  await app.run();
  return app;
}

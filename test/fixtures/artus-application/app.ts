import { FrameworkBar } from '../frameworks/bar';

class MyArtusApplication extends FrameworkBar {

}

export async function main() {
  const app = new MyArtusApplication();
  await app.run();
  return app;
}

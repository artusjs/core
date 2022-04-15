import { FrameworkFoo } from '../frameworks/foo';

class MyArtusApplication extends FrameworkFoo {

}

export async function main() {
  const app = new MyArtusApplication();
  await app.run();
  return app;
}

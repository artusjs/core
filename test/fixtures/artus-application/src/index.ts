import { Manifest } from "../../../../src";
import { FrameworkBar } from '../../frameworks/bar/src';

export default class MyArtusApplication extends FrameworkBar {
}

export async function main(manifest: Manifest) {
  const app = new MyArtusApplication();
  await app.load(manifest);
  await app.run();
  return app;
}

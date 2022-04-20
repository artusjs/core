import { ArtusApplication, Manifest } from "../../../../src";

export class AppBoot {
  static async main(manifest: Manifest) {
    const app = new ArtusApplication();
    await app.load(manifest);
    await app.run();
    return app;
  }
}

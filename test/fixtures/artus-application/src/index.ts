import { Manifest, ArtusApplication } from "../../../../src";
import { AbstractBar } from '../../frameworks/bar/src';
import { Inject } from "@artus/injection"

export default class MyArtusApplication {
  @Inject('ABSTRACT_BAR')
  // @ts-ignore
  private bar: AbstractBar;
  public artus: ArtusApplication;

  constructor() {
    this.artus = new ArtusApplication();
  }

  isListening(): boolean {
    return this.bar.isListening();
  }

  async run(manifest: Manifest) {
    await this.artus.load(manifest);
    await this.artus.run();
  }
}

export async function main(manifest: Manifest) {
  const app = new MyArtusApplication();
  await app.run(manifest);
  return app;
}

import path from 'path';
import { Manifest, ArtusApplication, ArtusInjectEnum } from "../../../../src";
import { AbstractBar } from '../../frameworks/bar/src';
import { Inject, Injectable } from "@artus/injection"

@Injectable()
export default class MyArtusApplication {
  @Inject('ABSTRACT_BAR')
  // @ts-ignore
  private bar: AbstractBar;
  @Inject(ArtusInjectEnum.Application)
  // @ts-ignore
  public artus: ArtusApplication;

  static async instance(manifest: Manifest): Promise<MyArtusApplication> {
    const app = new ArtusApplication();
    await app.load(manifest, path.join(__dirname, '..'));
    const instance = app.getContainer().get(MyArtusApplication);
    return instance;
  }

  isListening(): boolean {
    return this.bar.isListening();
  }

  async run() {
    await this.artus.run();
  }
}

export async function main(manifest: Manifest) {
  const app = await MyArtusApplication.instance(manifest);
  await app.run();
  return app;
}

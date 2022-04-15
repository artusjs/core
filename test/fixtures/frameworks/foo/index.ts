import path from 'path';
import { DefineFramework } from '../../../../src';
import { ArtusApplication } from '../../../../src';
import { server } from './lifecycle';

type Mod = {
  loader: 'module',
  path: string
}


@DefineFramework({
  path: __dirname
})
export class FrameworkFoo extends ArtusApplication {
  private mods: Mod[];

  constructor() {
    super();
    this.mods = [];
  }

  loadFile(path: string) {
    this.mods.push({ loader: 'module', path });
  }

  async run(): Promise<void> {
    // load http trigger
    await super.load({
      rootDir: __dirname,
      items: [
        {
          loader: 'module',
          path: path.resolve(__dirname, './src/trigger/http')
        },
        ...this.mods
      ]
    });

    await super.run();
  }

  isListening() {
    return server.listening;
  }
}

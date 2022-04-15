import path from 'path';
import { DefineFramework } from '../../../../src';
import { ArtusApplication } from '../../../../src';
import { server } from './lifecycle';


@DefineFramework({
  path: __dirname
})
export class FrameworkFoo extends ArtusApplication {
  async run(): Promise<void> {
    // load http trigger
    await super.load({
      rootDir: __dirname,
      items: [
        {
          loader: 'module',
          path: path.resolve(__dirname, './src/trigger/http')
        },
        {
          loader: 'module',
          path: path.resolve(__dirname, './src/controller/hello')
        }
      ]
    });

    await super.run();
  }

  isListening() {
    return server.listening;
  }
}

import { ArtusApplication } from '../../../src';
import { ApplicationHook } from '../../../src/decorator';

const app = new ArtusApplication();

export class ApplicationHookExtension {
  @ApplicationHook(app)
  didLoad() {
    console.log('didLoad');
  }
}

async function main () {
  await app.load({
    rootDir: __dirname,
    items: []
  });
  await app.run();
};

export default main;
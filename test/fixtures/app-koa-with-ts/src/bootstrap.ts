import path from 'path';
import { ArtusApplication } from '../../../../src';
import { ApplicationHookExtension, server } from './app';
import KoaApplication from './koaApp';

async function main() {
  const app: ArtusApplication = new ArtusApplication({
    hookClass: ApplicationHookExtension,
    initClassList: [
      KoaApplication
    ]
  });
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './httpTrigger')
      },
      {
        loader: 'module',
        path: path.resolve(__dirname, './controllers/test')
      }
    ]
  });
  await app.run();

  return app;
};

const isListening = () => server.listening;

export {
  main,
  isListening
};

import path from 'path';
import { ArtusApplication } from '../../../../src';
import { server } from './app';

async function main() {
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './koaApp')
      },
      {
        loader: 'module',
        path: path.resolve(__dirname, './httpTrigger')
      },
      {
        loader: 'module',
        path: path.resolve(__dirname, './controllers/hello')
      },
      {
        loader: 'module',
        path: path.resolve(__dirname, './services/hello')
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

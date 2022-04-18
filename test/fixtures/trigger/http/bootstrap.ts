import path from 'path';
import { ArtusApplication } from '../../../../src';
import { server } from './app';

async function main() {
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    items: [
      {
        path: path.resolve(__dirname, './app'),
        extname: '.ts',
        filename: 'app.ts',
        loader: 'extension',
        source: 'app'
      },
      {
        path: path.resolve(__dirname, './httpTrigger'),
        extname: '.ts',
        filename: 'httpTrigger.ts',
        loader: 'module',
        source: 'app'
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

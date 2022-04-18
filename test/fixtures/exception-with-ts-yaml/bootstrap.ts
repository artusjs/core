import path from 'path';
import { ArtusApplication } from '../../../src';
import { server } from './app';

async function main() {
  const app = new ArtusApplication();
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
        path: path.resolve(__dirname, '../../../artus-exception.yaml'),
        extname: '.yaml',
        filename: 'artus-exception.yaml',
        loader: 'exception',
        source: 'app'
      },
      {
        path: path.resolve(__dirname, './artus-exception.yaml'),
        extname: '.yaml',
        filename: 'artus-exception.yaml',
        loader: 'exception',
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

import path from 'path';
import { ArtusApplication } from '../../../src';
import { server } from './app';

async function main() {
  const app = new ArtusApplication();
  await app.load({
    app: {
      extension: [
        {
          path: path.resolve(__dirname, './app'),
          extname: '.ts',
          filename: 'app.ts',
        }
      ],
      exception: [
        {
          path: path.resolve(__dirname, '../../../artus-exception.yaml'),
          extname: '.yaml',
          filename: 'artus-exception.yaml',
        },
        {
          path: path.resolve(__dirname, './artus-exception.yaml'),
          extname: '.yaml',
          filename: 'artus-exception.yaml',
        }
      ]
    }
  });
  await app.run();
  return app;
};

const isListening = () => server.listening;

export {
  main,
  isListening
};

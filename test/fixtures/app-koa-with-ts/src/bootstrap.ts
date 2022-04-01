import path from 'path';
import { artusContainer, ArtusApplication, getArtusApplication } from '../../../../src';
import { HttpTrigger } from './httpTrigger';
import { server } from './app';

artusContainer.set({ type: HttpTrigger });

async function main() {
  const app: ArtusApplication = getArtusApplication();
  await app.load({
    rootDir: __dirname,
    items: [
      {
        loader: 'module',
        path: path.resolve(__dirname, './controllers/test.ts')
      }
    ]
  });
  await app.run();
};

const isListening = () => server.listening;

export {
  main,
  isListening
};

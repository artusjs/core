import  path from 'path';
import { ArtusApplication } from '../../../../src';
import { event } from './app';

async function main() {
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    items: [
      {
        path: path.resolve(__dirname, './app'),
        extname: '.ts',
        filename: 'app.ts',
        loader: 'lifecycle-hook-unit',
        source: 'app'
      },
      {
        path: path.resolve(__dirname, './event_trigger'),
        extname: '.ts',
        filename: 'event_trigger.ts',
        loader: 'module',
        source: 'app'
      }
    ]
  });
  await app.run();

  return app;
};

function pub(e: 'e1' | 'e2', p: any) {
  event.emit(e, p);
}

export {
  main,
  pub
};

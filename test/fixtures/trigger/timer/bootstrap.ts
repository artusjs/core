import path from 'path';
import { ArtusApplication } from '../../../../src';
import { execution } from './app';

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
        path: path.resolve(__dirname, './timerTrigger'),
        extname: '.ts',
        filename: 'timerTrigger.ts',
        loader: 'module',
        source: 'app'
      }
    ]
  });
  await app.run();

  return app;
};

function getTaskExecution() {
  return execution;
}

export {
  main,
  getTaskExecution
};
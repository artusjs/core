import path from 'path';
import { ArtusApplication } from '../../../src';

async function main() {
  const app = new ArtusApplication();
  app.container.set({
    id: 'mock_exception_set',
    value: new Set(),
  });
  await app.load({
    items: [
      {
        path: path.resolve(__dirname, './filter'),
        extname: '.ts',
        filename: 'filter.ts',
        loader: 'exception_filter',
        loaderState: {
          exportNames: [
            'TestInvalidFilter',
          ],
        },
        source: 'app',
      },
    ],
  });
  await app.run();
  return app;
}

export {
  main,
};

import path from 'path';
import { ArtusApplication } from '../../../src';

const rootDir = path.resolve(__dirname, './');

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
      config: [
        {
          path: path.resolve(rootDir, './config/config.default.ts'),
          extname: '.ts',
          filename: 'config.default.ts',
        },
        {
          path: path.resolve(rootDir, './config/config.production.ts'),
          extname: '.ts',
          filename: 'config.production.ts',
        }
      ]
    }
  });
  return app;
};


export {
  main,
};

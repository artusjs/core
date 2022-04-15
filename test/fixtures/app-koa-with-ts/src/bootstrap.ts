import path from 'path';
import { ArtusApplication } from '../../../../src';
import { server } from './app';

async function main() {
  const app: ArtusApplication = new ArtusApplication();
  await app.load({
    app: {
      extension: [
        {
          path: path.resolve(__dirname, './app'),
          extname: '.ts',
          filename: 'app.ts',
        }
      ],
      items: [
        {
          path: path.resolve(__dirname, './koaApp'),
          extname: '.ts',
          filename: 'koaApp.ts'
        },
        {
          path: path.resolve(__dirname, './httpTrigger'),
          extname: '.ts',
          filename: 'httpTrigger.ts'
        },
        {
          path: path.resolve(__dirname, './controllers/hello'),
          extname: '.ts',
          filename: 'hello.ts'
        },
        {
          path: path.resolve(__dirname, './services/hello'),
          extname: '.ts',
          filename: 'hello.ts'
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

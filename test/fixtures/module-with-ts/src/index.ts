import path from 'path';
import { Manifest } from '../../../../src';

const rootDir = path.resolve(__dirname, './');

export default ({
  app: {
    items: [
      {
        path: path.resolve(rootDir, './testServiceA.ts'),
        extname: '.ts',
        filename: 'testServiceA.ts',
      },
      {
        path: path.resolve(rootDir, './testServiceB.ts'),
        extname: '.ts',
        filename: 'testServiceB.ts',
      }
    ]
  }
}) as Manifest;

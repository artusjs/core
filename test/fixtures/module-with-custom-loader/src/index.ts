import path from 'path';
import { Manifest } from '../../../../src';

const rootDir = path.resolve(__dirname, './');


export default ({
  items: [
    {
      path: path.resolve(rootDir, './testClazz.ts'),
      extname: '.ts',
      filename: 'testClazz.ts',
      loader: 'test-custom-loader'
    }
  ]
}) as Manifest;

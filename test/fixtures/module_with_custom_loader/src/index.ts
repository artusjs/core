import path from 'path';
import { Manifest } from '../../../../src';

const rootDir = path.resolve(__dirname, './');


export default ({
  items: [
    {
      path: path.resolve(rootDir, './test_clazz.ts'),
      extname: '.ts',
      filename: 'test_clazz.ts',
      loader: 'test-custom-loader',
      _loaderState: {
        hello: 'loaderState',
      },
    },
  ],
}) as Manifest;

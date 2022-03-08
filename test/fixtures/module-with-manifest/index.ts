import path from 'path';

const rootDir = path.resolve(__dirname, './');

export default ({
  rootDir,
  units: [
    {
      loader: 'module',
      path: path.resolve(rootDir, './src/testService.ts')
    }
  ]
});
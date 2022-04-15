const path = require('path');

const rootDir = path.resolve(__dirname, './');

module.exports = ({
  app: {
    items: [
      {
        id: 'testServiceA',
        path: path.resolve(rootDir, './testServiceA.js'),
        extname: '.js',
        filename: 'testServiceA.js',
      },
      {
        id: 'testServiceB',
        scope: 'Execution',
        path: path.resolve(rootDir, './testServiceB.js'),
        extname: '.js',
        filename: 'testServiceB.js',
      }
    ]
  }
});

const path = require('path');

const rootDir = path.resolve(__dirname, './');

module.exports = ({
  items: [
    {
      id: 'testServiceA',
      path: path.resolve(rootDir, './test_service_a.js'),
      extname: '.js',
      filename: 'test_service_a.js',
    },
    {
      id: 'testServiceB',
      scope: 'Execution',
      path: path.resolve(rootDir, './test_service_b.js'),
      extname: '.js',
      filename: 'test_service_b.js',
    }
  ]
});

import path from 'path';

export default {
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../redis_plugin'),
  },
  mysql: {
    enable: false,
    path: path.resolve(__dirname, '../mysql_plugin'),
  },
  testDuplicate: {
    enable: false,
    package: '@artus/injection', // This package is unimportant, will be replaced by path in dev config
  },
};

import path from 'path';

export default {
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../redis_plugin')
  },
  mysql: {
    enable: false,
    path: path.resolve(__dirname, '../mysql_plugin')
  },
  testDuplicate: {
    enable: false,
    package: 'unimportant-package'
  },
};

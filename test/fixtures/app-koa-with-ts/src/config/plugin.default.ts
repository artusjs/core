import path from 'path';

export default {
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../redis-plugin')
  },
  mysql: {
    enable: false,
    path: path.resolve(__dirname, '../mysql-plugin')
  },
};

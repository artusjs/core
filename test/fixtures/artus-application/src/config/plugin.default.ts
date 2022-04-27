import path from 'path';

export default {
  mysql: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus-plugin-mysql-rds')
  },
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus-plugin-redis')
  },
  base: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus-plugin-base')
  }
}
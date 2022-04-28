import path from 'path';

export default {
  mysql: {
    enable: true,
    path: path.resolve(__dirname, '../plugins/artus-plugin-mysql-ob')
  },
  redis: {
    enable: false
  },
}
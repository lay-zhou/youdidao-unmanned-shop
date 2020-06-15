import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  graphql: {
    enable: true,
    package: 'egg-gql',
  },
  redis: {
    enable: true,
    package: 'egg-redis'
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  wechatPay: {
    enable: true,
    package: 'egg-wechat-pay'
  },
  curl: {
    enable: true,
    package: 'egg-curl'
  },
  io: {
    enable: true,
    package: 'egg-socket.io',
  },
};

export default plugin;

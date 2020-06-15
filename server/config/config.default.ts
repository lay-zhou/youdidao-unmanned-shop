import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1550036844430_9558';

  // add your egg config in here
  config.middleware = ['graphql'];

  config.curl = {
    defContentType: 'application/json; charset=UTF-8', // 默认的Content-Type
    defDataType: 'text', // 默认的dataType
    timeout: [10000, 10000] // 连接和返回的超时时间
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ],
  };

  // io
  config.io = {
    init: {
      wsEngine: 'ws',
    }, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [
          'auth',
        ],
        packetMiddleware: [],
      },
      '/example': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },

    redis: {
      host: '127.0.0.1',
      port: 6379,
    },
  };

  // Redis
  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0,
    },
  };

  // 数据库配置
  config.sequelize = {
    dialect: 'mysql',
    database: 'xxxx',
    host: 'localhost',
    port: 3306,
    username: 'xxxx',
    password: 'xxxx',
    define: {
      collate: 'utf8mb4_unicode_ci',
      freezeTableName: true,
      timestamps: true,
      underscored: false,
    },
  };

  // 微信支付
  config.wechatPay = {
    client: {
      bodyPrefix: 'xxxx',
      appId: 'xxxx',
      merchantId: 'xxxx',
      secret: 'xxxx',
      notifyUrl: 'xxxx',
    },
  };

  // 第三方配置
  config.thirdParty = {
    // 阿里云短信
    aliyunSms: {
      accessKeyId: 'xxxx',
      secretAccessKey: 'xxxx',
      SignName: 'xxxx',
      TemplateCode: 'xxxx',
    },
    // 百度云
    baidu: {
      AppId: 'xxxx',
      APIKey: 'xxxx',
      SecretKey: 'xxxx',
    },
  }

  // add your special config in here
  const bizConfig = {
    // 阿里云配置
    aliyun: {
      ACCESS_KEY_ID: 'xxxx',
      ACCESS_KEY_SECRET: 'xxxx',
      BUCKET: 'xxxx',
      HOST: 'xxxx',
      REGION: 'xxxx',
    },

    // JWT 配置
    jwt: {
      enable: true,
      match(ctx) {
        const { method, path } = ctx;
        const reg = /^Bearer /;
        return (
          method === 'POST' &&
          path === '/graphql' &&
          reg.test(ctx.get('Authorization'))
        );
      },
      secret: 'xxxx',
    },
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};

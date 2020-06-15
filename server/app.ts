class AppBootHook {
  app: any;
  constructor(app) {
    this.app = app;
  }

  async willReady() {
    const { app } = this;
    if (app.config.env === 'local') {
      await app.model.sync();
      if (await app.model.Config.count() === 0) {
        const configDefaultValues = [
          {
            key: 'appId',
            name: '小程序ID',
            type: 'string',
          },
          {
            key: 'appSecret',
            name: '小程序密钥',
            type: 'string',
          },
          {
            key: 'confusion',
            name: '常见问题',
            type: 'html',
          },
          {
            key: 'about',
            name: '关于我们',
            type: 'html',
          },
          {
            key: 'cost',
            name: '配送费用',
            type: 'integer',
          },
          {
            key: 'free',
            name: '免配送金额',
            type: 'integer',
          },
          {
            key: 'agreement',
            name: '用户协议',
            type: 'html',
          },
        ];
        await app.model.Config.bulkCreate(configDefaultValues);
      }
    }
  }
}

module.exports = AppBootHook;

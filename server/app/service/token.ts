import { Service } from 'egg';

/**
 * Token Service
 */
export default class Token extends Service {

  async generateToken(userId: string) {
    const { app } = this;
    return app.jwt.sign(
      {
        sub: userId,
      },
      app.config.jwt.secret,
    );
  };
  async generateAccessToken() {
    const { ctx } = this;
    const { Config } = this.ctx.model;
    const { string: appId } = await Config.findByPk('appId');
    const { string: appSecret } = await Config.findByPk('appSecret');
    const uri = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const { data } = await ctx.curl(uri, { dataType: 'json', timeout: 30000 });
    return data.access_token;
  };
}

import { Service } from 'egg';

/**
 * Token Service
 */
export default class WxFile extends Service {
  public async requestWechatServer(code) {
    const { ctx } = this;
    const { Config } = ctx.model;
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const appId = await Config.findByPk('appId');
    const appSecret = await Config.findByPk('appSecret');
    const allUrl = `${url}?appid=${appId.string}&secret=${appSecret.string}&js_code=${code}&grant_type=authorization_code`;
    const result = await ctx.curl(allUrl, { dataType: 'json', timeout: 30000 });
    return result.data;
  }
}

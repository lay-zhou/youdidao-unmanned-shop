import { Service } from 'egg';
class UserService extends Service {
   constructor(ctx) {
      super(ctx);
    }
   async exchangeUserInfo(code){
      const { ctx } = this;
      const { Config } = ctx.model;
      const appInfo = await Config.findByPk('appId');
      const appSecret = await Config.findByPk('appSecret');
      const js_code = code;
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appInfo.string}&secret=${appSecret.string}&js_code=${js_code}&grant_type=authorization_code`;
      // code2Session
      const result = await ctx.curl(url, { dataType: 'json', timeout: 30000 });
      const data = result.data;
      return data;
   }
}
module.exports = UserService;
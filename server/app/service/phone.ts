import { Service } from 'egg';

module.exports = class PhoneService extends Service {
  ctx: any;
  app: any;

  constructor(ctx) {
    super(ctx);
  }


  // 通过微信服务器获得用户的手机号
  async bindPhoneByWx(params) {
    const { ctx } = this;
    const userId = ctx.state.user.sub;
    const { code, encryptedData, iv } = params;
    const {
      session_key: sessionKey,
    } = await ctx.service.wxFile.requestWechatServer(code);
    if (sessionKey) {
      const data = await ctx.service.wxBizData.decryptData(
        encryptedData,
        iv,
        sessionKey,
      );
      const defaults = { number: data.phoneNumber, userId };
      const [userPhone] = await ctx.model.Phone.findOrCreate({
        defaults,
        where: { userId },
      });
      await userPhone.update({ number: data.phoneNumber });
      return userPhone;
    } else {
      ctx.status = 404;
    }
  }
};

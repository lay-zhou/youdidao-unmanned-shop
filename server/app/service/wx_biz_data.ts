import { Service } from 'egg';
import * as crypto from 'crypto';

export default class WxBizData extends Service {

  // 解密用户信息加密数据
  public async decryptData(encryptedData, iv, sessionKey) {
    const { ctx } = this;
    const { Config } = ctx.model;
    sessionKey = new Buffer(sessionKey, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');
    let decoded: any;
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Illegal Buffer');
    }
    const appId = await Config.findByPk('appId');
    if (decoded.watermark.appid !== appId.string) {
      throw new Error('Illegal Buffer');
    }

    return decoded;
  }
}

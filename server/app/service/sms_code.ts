const Service = require('egg').Service;
import SMSClient = require('@alicloud/sms-sdk');

class SmsCodeService extends Service {
  constructor(ctx) {
    super(ctx);
    const { accessKeyId, secretAccessKey } = this.app.config.thirdParty.aliyunSms;
    this.smsClient = new SMSClient({ accessKeyId, secretAccessKey });
  }
  // 发送短信
  async send(sendData) {
    const { SignName } = this.app.config.thirdParty.aliyunSms;
    const { phone, nickname, TemplateCode } = sendData;
    const data: any = {
      PhoneNumbers: phone,
      SignName,
      TemplateCode,
    };
    if (nickname) data.TemplateParam = JSON.stringify({ nickname });
    if (phone.length === 11) {
      const res = await this.smsClient.sendSMS(data);
      const { Code } = res;
      if (Code === 'OK') return true;
      return false;
    }

  }

}

module.exports = SmsCodeService;

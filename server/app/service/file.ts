import * as OSS from 'ali-oss';
import * as crypto from 'crypto';
import { Service } from 'egg';
import * as moment from 'moment';
import qr = require('qr-image');

export default class FileService extends Service {
  private client;

  constructor(ctx) {
    super(ctx);

    const { app } = ctx;

    const { config } = app;

    const {
      ACCESS_KEY_ID: accessKeyId,
      ACCESS_KEY_SECRET: accessKeySecret,
      BUCKET: bucket,
      REGION: region,
    } = config.aliyun;

    this.client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    });
  }

  // 生成私有下载链接
  generatePrivateDownloadUrl(key) {
    const { client } = this;

    return client.signatureUrl(key);
  };

  async generateUploadParams() {
    const { app, ctx } = this;

    const { config } = app;

    const { ACCESS_KEY_ID: accessKeyId, HOST: host } = config.aliyun;

    const { key } = await ctx.model.File.create();

    const expirationMoment = moment().add(1, 'hours');

    const policy = this.generatePolicyBase64(expirationMoment, key);

    const signature = this.generateSignature(policy);

    return {
      key,
      accessid: accessKeyId,
      host,
      policy,
      signature,
      expire: expirationMoment.unix(),
    };
  };

  generatePolicyBase64(expirationMoment, key) {
    const { app } = this;

    const { config } = app;

    const { BUCKET: bucket } = config.aliyun;

    const policyText = {
      // 设置 policy 过期时间
      expiration: expirationMoment.toISOString(),
      // 限制条件
      conditions: [
        // 存储空间
        { bucket },
        // 文件名
        { key },
        // 文件大小范围
        ['content-length-range', 0, 2 * 1024 * 1024],
      ],
    };

    const buffer = new Buffer(JSON.stringify(policyText));

    return buffer.toString('base64');
  };

  generateSignature(policy) {
    const { app } = this;

    const { config } = app;

    const { ACCESS_KEY_SECRET: accessKeySecret } = config.aliyun;

    return crypto
      .createHmac('sha1', accessKeySecret)
      .update(policy)
      .digest()
      .toString('base64');
  };

  /**
   * 删除阿里云文件接口
   * @param key 图片key值
   */
  async delete(key) {
    const { client } = this;
    try {
      const result = await client.delete(key);
      return result;
    } catch (e) {
      console.log(e);
    }
  };
  /**
   * 上传至阿里云文件接口
   * @param orderId 店铺id
   * @param file 文件
   */
  async put(orderId, file) {
    const { client } = this;
    await client.put(`${orderId}.png`, file);
    return `${orderId}`;
  };

  // 生成二维码
  async generateImage(orderId) {
    console.log(orderId);
    const { Order } = this.ctx.model;
    const { code } = await Order.findByPk(orderId);
    const text = `id=${orderId}&code=${code}`;
    // 大小默认5，二维码周围间距默认1
    const img = qr.image(text || '', {
      type: 'png',
      size: 5,
      margin: 1,
    });
    await this.put(orderId, img);
    return orderId;
  }
}

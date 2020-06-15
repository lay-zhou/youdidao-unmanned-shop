import { Service } from 'egg';
import _ = require('lodash');
import urlencode = require('urlencode');
import md5 = require('md5');

module.exports = class StoreService extends Service {
  ctx: any;
  app: any;
  constructor(ctx) {
    super(ctx);
  }
  // 获取
  async fetch(params) {
    const { ctx } = this;
    console.log('StoreService fetch params', params);
    let pageSize = 10;
    if (params && params.pageSize) pageSize = Number(params.pageSize);
    const where: any = {};
    const { status, type } = params;
    if (status) where.status = status;
    const user = await ctx.model.User.findByPk(ctx.state.user.sub);
    if (user.role !== 'admin') {
      where.status = 'published';
    }
    if (type && type === 'weapp') {
      switch (user.role) {
        case 'facilitator':
          where.facilitatorId = user.id;
          break;
        default:
          break;
      }
    }
    const options: any = {
      limit: pageSize,
      offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [
        ['balance', 'DESC'],
      ],
      raw: true,
      where,
    };
    if (type) {
      const user = await ctx.model.User.findByPk(ctx.state.user.sub);
      options.include = [{
        as: 'users',
        model: ctx.model.User,
        where: { id: user.id },
      }];
    }
    const {
      count: total, rows: list,
    } = await ctx.model.Store.findAndCountAll(options);
    const newList: any = [];
    for (const iterator of list) {
      if (iterator.imageKey) {
        iterator.imageUrl = await ctx.service.file.generatePrivateDownloadUrl(iterator.imageKey);
        await newList.push(iterator);
      } else {
        iterator.imageUrl = null;
        await newList.push(iterator);
      }
    };
    console.log('newList', newList);
    return {
      list: newList,
      pagination: {
        total,
        pageSize,
        current: parseInt(params.currentPage, 10) || 1,
      },
    };
  };

  // 根据地址获取
  async near(input) {
    const { ctx } = this;
    const { longitude, latitude } = input;
    let pageSize = 10;
    if (input.pageSize) pageSize = Number(input.pageSize);
    const where: any = {};
    where.status = 'published';
    const options: any = {
      limit: pageSize,
      offset: input.currentPage ? pageSize * (input.currentPage - 1) : 0,
      where,
      distinct: true,
      raw: true,
    };
    if (longitude && latitude) {
      options.attributes = {
        include: [[
          ctx.model.literal(`ROUND(
            6378.138 * 2 * ASIN(
                SQRT(
                    POW(
                        SIN(
                            (
                                ${Number(latitude)} * PI() / 180 - ${ctx.model.col('latitude').col} * PI() / 180
                            ) / 2
                        ),
                        2
                    ) + COS(${Number(latitude)} * PI() / 180) * COS(${ctx.model.col('latitude').col} * PI() / 180) * POW(
                        SIN(
                            (
                                ${Number(longitude)} * PI() / 180 - ${ctx.model.col('longitude').col} * PI() / 180
                            ) / 2
                        ),
                        2
                    )
                )
            ) * 1000
        )`),
          'distance',
        ]],
      };
      options.order = [[ctx.model.literal(`ROUND(
        6378.138 * 2 * ASIN(
            SQRT(
                POW(
                    SIN(
                        (
                            ${Number(latitude)} * PI() / 180 - ${ctx.model.col('latitude').col} * PI() / 180
                        ) / 2
                    ),
                    2
                ) + COS(${Number(latitude)} * PI() / 180) * COS(${ctx.model.col('latitude').col} * PI() / 180) * POW(
                    SIN(
                        (
                            ${Number(longitude)} * PI() / 180 - ${ctx.model.col('longitude').col} * PI() / 180
                        ) / 2
                    ),
                    2
                )
            )
        ) * 1000
    )`), 'ASC']];
    }
    console.log('model Store findAndCountAll options', options);
    const total = await ctx.model.Store.count();
    const list = await ctx.model.Store.findAll(options);
    const newList: any = [];
    for (const iterator of list) {
      // 取到新的url
      console.log('Query items for iterator', iterator);
      if (iterator.imageKey) {
        iterator.imageUrl = await ctx.service.file.generatePrivateDownloadUrl(iterator.imageKey);
        await newList.push(iterator);
      } else {
        iterator.imageUrl = null;
        await newList.push(iterator);
      }
    }
    return {
      list: newList,
      pagination: {
        total,
        pageSize,
        current: parseInt(input.currentPage, 10) || 1,
      },
    };
  };

  async findById(id) {
    const { ctx } = this;
    const { Store, Order } = this.ctx.model;
    // 找到当前店铺的信息
    const result = await Store.findByPk(id);
    const currentUser = await ctx.model.User.findByPk(ctx.state.user.sub);
    const followed = await result.hasUser(currentUser);
    console.log('findById result', result);
    const sentiment = await Order.count({
      where: {
        storeId: result.id,
      },
    });
    result.sentiment = sentiment;
    result.followed = followed;
    if (result.imageKey) {
      result.imageUrl = await this.ctx.service.file.generatePrivateDownloadUrl(result.imageKey);
    } else {
      result.imageUrl = null;
    }
    const orders = await Order.findAll({
      where: {
        storeId: result.id,
        status: { [ctx.model.Op.not]: 'unpaid' },
      },
    });
    // 即为总销售额
    let sales = 0;
    for (const iterator of orders) {
      const { amount } = iterator;
      sales += amount;
    }
    result.sales = sales;
    return result;
  };

  // 创建店铺
  async create(input) {
    const { ctx } = this;
    const { model } = ctx;
    const { Store, User, Phone } = model;
    const phone = await Phone.findByPk(input.phone);
    if (phone) {
      const user = await User.findByPk(phone.userId);
      if (user === 'user') {
        await user.update({ role: 'merchant' });
      }
      const store = await Store.findOne({ where: { userId: user.id } });
      if (!store) {
        input.userId = user.id;
      }
    } else {
      const user = await User.create({ role: 'merchant' });
      await Phone.create({
        number: input.phone,
        userId: user.id,
      });
      input.userId = user.id;
    }
    const store = await Store.create(_.pickBy(
      _.pick(
        input,
        [
          'imageKey',
          'name',
          'address',
          'longitude',
          'latitude',
          'userId',
          'type',
        ]
      ),
      value => value !== null
    ));
    // 找到当前用户
    const user = await User.findByPk(ctx.state.user.sub);
    if (user.role !== 'admin') {
      await store.update({
        founderId: user.id,
      });
    }
    return store;
  };

  // 更新
  async update(input) {
    const { ctx } = this;
    const { model } = ctx;
    const { Store } = model;
    const store = await Store.findByPk(input.id);
    await store.update(_.pickBy(
      _.pick(
        input,
        ['imageKey', 'name', 'address', 'longitude', 'latitude', 'type']
      )));
    return store;
  };

  /**
   * 解析用户输入的地址
   * @param address 用户数组的地址
   */
  async addressResolution(address: string) {
    /**
     * key为腾讯地图中配置的key值
     * sk为key设置中WebServiceAPI中选择签名校验随机生成的sk
     * 签名计算方式: ☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟☟
     * 请求路径+”?”+请求参数+SK进行拼接，并计算拼接后字符串md5值，即为签名(sig)
     * 请求参数必须是未进行任何编码（如urlencode）的原始数据
     * 对参数进行排序：按参数名升序
     * 详情参考官方文档：https://lbs.qq.com/FAQ/key_faq.html
     */
    const { ctx } = this;
    const key = 'IJRBZ-PXQCQ-HYW53-GASFE-R5B5E-7XFIQ';
    const sk = 'GaG2d8yXAWRIsPKQkAsgYja5ifzoMNkx';
    const sig = md5(`/ws/geocoder/v1/?address=${address}&key=${key}${sk}`);
    const uri = 'https://apis.map.qq.com/ws/geocoder/v1/?';
    const url = `${uri}address=${urlencode(address)}&key=${key}&sig=${sig}`;
    const { res } = await ctx.curl(url);
    // 将返回的buffer转化为字符串再转化为jason对象
    const { result } = JSON.parse(res.data.toString());
    return result.location;
  };

  // 地址估算
  async calculation(input) {
    /**
     * 此接口返回的是一个数组 原功能是能够查取多个地址 即 一对多 这里不做扩展
     * 详情查看文档: https://lbs.qq.com/webservice_v1/guide-distance.html
     */
    const { ctx } = this;
    const { from, to } = input;
    const key = 'JEVBZ-UO2KF-3MSJW-NAJ3A-XA4DE-ZZFJY';
    const sk = 'ukiKYwHNn8dHVwosIhiDoPFXZsmNcPc3';
    const md5Url = `/ws/distance/v1/?from=${from.lat},${from.lng}&key=${key}&mode=driving&to=${to.lat},${to.lng}${sk}`;
    const sig = md5(`${md5Url}`);
    const uri = 'https://apis.map.qq.com/ws/distance/v1/';
    const { res } = await ctx.curl(`${uri}?mode=driving&from=${from.lat},${from.lng}&to=${to.lat},${to.lng}&key=${key}&sig=${sig}`);
    // 将返回的buffer转化为字符串再转化为jason对象
    const { result } = JSON.parse(res.data.toString());
    return result.elements[0];
  };
}

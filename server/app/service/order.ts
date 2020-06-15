const Service = require('egg').Service;
import moment = require('moment');
import _ = require('lodash');
import { ForbiddenError } from 'apollo-server';

module.exports = class OrderService extends Service {
  ctx: any;
  app: any;
  constructor(ctx) {
    super(ctx);
  }
  // 获取
  async fetch(params) {
    const { ctx } = this;
    const { Order, Op, User, Store } = ctx.model;
    let pageSize = 10;
    if (params && params.pageSize) pageSize = Number(params.pageSize);
    const where: any = {};
    where.status = { [Op.not]: 'unpaid' };
    const { userId, storeId, status, type } = params;
    const user = await User.findByPk(ctx.state.user.sub);
    switch (user.role) {
      case 'user':
        where.userId = user.id;
        break;
      case 'member':
        where.userId = user.id;
        break;
      case 'merchant':
        const store = await Store.findOne({ where: { userId: user.id } });
        where.storeId = store.id;
        break;

      default:
        break;
    }
    if (status) where.status = status;
    if (type && type !== 'merge') where.type = type;
    if (type === 'merge') {
      where.type = {
        [Op.or]: ['distribution', 'unmanned'],
      };
    }
    if (userId) where.userId = userId;
    if (storeId) where.storeId = storeId;
    const options: any = {
      limit: pageSize,
      offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [
        ['id', 'DESC'],
      ],
      raw: true,
      where,
    };
    const {
      count: total, rows: list,
    } = await Order.findAndCountAll(options);
    const newList: any = [];
    for (const iterator of list) {
      if (iterator.code) {
        iterator.qrCode = await ctx.service.file.generatePrivateDownloadUrl(`${iterator.id}.png`);
        await newList.push(iterator);
      } else {
        iterator.qrCode = null;
        await newList.push(iterator);
      }
    }
    return {
      list: newList,
      pagination: {
        total,
        pageSize,
        current: parseInt(params.currentPage, 10) || 1,
      },
    };
  };

  // 创建
  async create(input) {
    const { ctx } = this;
    const {
      Order,
      Item,
      OrderItem,
      Store,
      Coupon,
      WechatAccount,
      Config,
      Address,
    } = ctx.model;
    if (input.type === 'storeBuy') {
      return await ctx.service.payWay.storePay(input);
    }
    // 找到当前用户的 openId
    const wechatAccount = await WechatAccount.findOne({
      where: {
        userId: ctx.state.user.sub,
      },
    });

    // 找到店铺
    const store = await Store.findByPk(input.storeId);

    // 取出商品的实际价格及数量
    const items: any = [];

    // 定义订单内的商品
    const orderItem: any = [];

    // 循环创建订单内的商品
    for (const iterator of input.itemIds) {
      const item = await Item.findByPk(iterator.itemId);
      await orderItem.push({
        fileKey: item.imageKey,
        title: item.name,
        price: item.price,
        commission: item.commission,
        amount: iterator.number * item.price,
        number: iterator.number,
        itemCode: item.code,
      });
      await items.push({
        price: item.price,
        number: iterator.number,
      });
    }
    let code = '';
    for (let i = 0; i < 8; i++) {
      const num = Math.floor(Math.random() * 10);
      code += num;
    }
    // 整合订单所需参数
    const data: any = {
      userId: wechatAccount.userId,
      storeId: store.id,
      time: input.time,
      price: items.reduce(
        (total, { price, number }) => total + price * number,
        0,
      ),
      amount: items.reduce(
        (total, { price, number }) => total + price * number,
        0,
      ),
      code,
    };
    // 邮费相关
    const rel = await Config.findByPk('free');
    const cost = await Config.findByPk('cost');
    // pe
    if (data.amount < rel.integer && input.address && input.address.receiverName) {
      data.amount += cost.integer;
    }
    // 创建订单
    const order = await Order.create(_.pickBy(
      _.pick(
        data,
        [
          'price',
          'discount',
          'amount',
          'couponId',
          'userId',
          'storeId',
          'code',
          'time',
        ]
      ),
      value => value !== null
    ));
    if (input.couponId) {
      // 找到所传优惠券
      const coupon = await Coupon.findByPk(input.couponId);
      // 判断优惠券是否存在 且价格是否大于等于优惠券需求的价格
      if (coupon && data.amount >= coupon.require) {
        data.discount += coupon.amount;
        data.amount -= coupon.amount;
        await coupon.update({ orderId: order.id });
      }
    }
    if (order) {
      // 生成二维码并存储至阿里云
      await ctx.service.file.generateImage(order.id);
      await order.update({ qrCode: code });
    }
    if (input.address && input.address.receiverName) {
      const { receiverName, receiverPhone, receiverAddress } = input.address;
      // 若地址存在 则更新订单为配送类型
      await order.update({ type: 'distribution' });
      // 并创建订单地址
      await Address.create({
        receiverName,
        receiverPhone,
        receiverAddress,
        orderId: order.id,
      });
    }
    // 循环创建订单内的商品
    for (const iterator of orderItem) {
      iterator.orderId = order.id;
      await OrderItem.create(iterator)
    }

    // 创建交易单号
    const { id: tradeId } = await order.createTrade({
      price: data.amount,
      orderId: order.id,
    });
    return await ctx.app.wechatPay.requestPayment({
      body: '购买商品',
      out_trade_no: String(tradeId),
      total_fee: order.amount,
      spbill_create_ip: ctx.get('x-real-ip'),
      trade_type: 'JSAPI',
      openid: wechatAccount.openId,
    });
  };

  async balanceCreate(input) {
    const { ctx } = this;
    const {
      Order,
      Item,
      OrderItem,
      Store,
      Coupon,
      WechatAccount,
      Config,
      Address,
      User,
      Point,
      Balance,
    } = ctx.model;
    // 找到当前用户的 openId
    const wechatAccount = await WechatAccount.findOne({
      where: {
        userId: ctx.state.user.sub,
      },
    });

    // 找到店铺
    const store = await Store.findByPk(input.storeId);

    // 取出商品的实际价格及数量
    const items: any = [];

    // 定义订单内的商品
    const orderItem: any = [];

    // 循环创建订单内的商品
    for (const iterator of input.itemIds) {
      const item = await Item.findByPk(iterator.itemId);
      await orderItem.push({
        fileKey: item.imageKey,
        title: item.name,
        price: item.price,
        commission: item.commission,
        amount: iterator.number * item.price,
        number: iterator.number,
        itemCode: item.code,
      });
      await items.push({
        price: item.price,
        number: iterator.number,
      });
    }
    let code = '';
    for (let i = 0; i < 8; i++) {
      const num = Math.floor(Math.random() * 10);
      code += num;
    }
    // 整合订单所需参数
    const data: any = {
      userId: wechatAccount.userId,
      storeId: store.id,
      time: input.time,
      price: items.reduce(
        (total, { price, number }) => total + price * number,
        0,
      ),
      amount: items.reduce(
        (total, { price, number }) => total + price * number,
        0,
      ),
      code,
    };
    // 邮费相关
    const rel = await Config.findByPk('free');
    const cost = await Config.findByPk('cost');
    if (data.amount < rel.integer && input.address && input.address.receiverName) {
      data.amount += cost.integer;
    }
    // 创建订单
    const order = await Order.create(_.pickBy(
      _.pick(data, [
        'price',
        'discount',
        'amount',
        'couponId',
        'userId',
        'storeId',
        'code',
        'time',
      ]), value => value !== null));
    if (input.couponId) {
      // 找到所传优惠券
      const coupon = await Coupon.findByPk(input.couponId);
      // 判断优惠券是否存在 且价格是否大于等于优惠券需求的价格
      if (coupon && data.amount >= coupon.require) {
        data.discount += coupon.amount;
        data.amount -= coupon.amount;
        await coupon.update({ orderId: order.id });
      }
    }
    if (order) {
      // 生成二维码并存储至阿里云
      await ctx.service.file.generateImage(order.id);
      await order.update({ qrCode: code });
    }
    if (input.address && input.address.receiverName) {
      const { receiverName, receiverPhone, receiverAddress } = input.address;
      // 若地址存在 则更新订单为配送类型
      await order.update({ type: 'distribution' });
      // 并创建订单地址
      await Address.create({
        receiverName,
        receiverPhone,
        receiverAddress,
        orderId: order.id,
      });
    }
    // 循环创建订单内的商品
    for (const iterator of orderItem) {
      iterator.orderId = order.id;
      await OrderItem.create(iterator)
    }

    // 创建交易单号
    const trade = await order.createTrade({
      price: data.amount,
      orderId: order.id,
    });
    // 找到当前用户
    const user = await User.findByPk(wechatAccount.userId);
    // 若用户的余额大于等于订单的总价
    if (user.balance >= order.amount) {
      // 更新交易状态
      await trade.update({ status: 'paid' });
      await order.update({ status: 'paid' });
      const coupon = await Coupon.findOne({
        where: {
          orderId: order.id,
        },
      });
      if (coupon) await coupon.update({ usedAt: order.createdAt });
      const orderItems = await OrderItem.findAll({
        where: {
          orderId: order.id,
        },
      });
      for (const iterator of orderItems) {
        await iterator.update({ status: 'completed' });
        const item = await Item.findByPk(iterator.itemCode);
        await item.update({ stock: item.stock - iterator.number });
      }
      const store = await Store.findByPk(order.storeId);
      // 记录店铺收入
      await Balance.create({
        balance: store.balance + order.amount,
        price: order.amount,
        add: true,
        remark: '店铺收入',
        userId: store.userId,
        storeId: store.id,
        orderId: order.id,
      });
      // 记录用户消费
      await Balance.create({
        balance: user.balance - order.amount,
        price: order.amount,
        add: false,
        remark: '用户消费',
        userId: order.userId,
        orderId: order.id,
      });
      await store.update({
        balance: store.balance + order.amount,
        sales: store.balance + order.amount,
      });
      // 找到当前用户
      const currentUser = await User.findByPk(order.userId);
      //  记录购买积分
      await Point.create({
        point: currentUser.point + order.amount,
        price: order.amount,
        add: 'true',
        remark: '购买商品所得',
        userId: currentUser.id,
        orderId: order.id,
      });
      await currentUser.update({
        point: currentUser.point + order.amount,
        balance: currentUser.balance - order.amount,
      });
      if (currentUser.inviterId) {
        // 找到当前用户的邀请者
        const inviterUser = await User.findByPk(currentUser.inviterId);
        if (inviterUser && inviterUser.role === 'member') await ctx.service.math.index(inviterUser.id, order.id)
      }
      return true;
    } else {
      throw new ForbiddenError('余额不足！');
    }
  }

  // 财务统计 本日 本周 本月 本年
  async timeOrder(time) {
    const { ctx } = this;
    const { Order, Store, Op } = ctx.model;

    // 定义一个事件数组
    const arr: any = [];
    switch (time) {
      case 'today':
        const beginToday = moment().subtract(0, "day").startOf('day').format('YYYY-MM-DD') + " 00:00:00";
        const endOfToday = moment().subtract(0, "day").endOf('day').format('YYYY-MM-DD') + " 23:59:59";
        arr.push(beginToday, endOfToday);
        break;
      case 'week':
        const beginWeek = moment().weekday(1).format('YYYY-MM-DD') + " 00:00:00";
        const endOfWeek = moment().weekday(7).format('YYYY-MM-DD') + " 23:59:59";
        arr.push(beginWeek, endOfWeek);
        break;
      case 'month':
        const beginMonth = moment().startOf('month').format("YYYY-MM-DD") + " 00:00:00";
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD') + " 23:59:59";
        arr.push(beginMonth, endOfMonth);
        break;
      case 'year':
        const beginYear = moment().startOf('year').format('YYYY-MM-DD') + " 00:00:00";
        const endOfYear = moment().endOf('year').format('YYYY-MM-DD') + " 23:59:59";
        arr.push(beginYear, endOfYear);
        break;

      default:
        break;
    };

    // 根据登录的用户查找店铺
    const myStore = await Store.findOne({
      where: {
        userId: ctx.state.user.sub,
      }
    });
    // 通过店铺ID查找订单
    const totalOrder = await Order.findAll({
      where: {
        storeId: myStore.id,
        status: {
          [Op.not]: 'unpaid',
        },
      },
      raw: true
    });
    // 带有时间条件的店铺订单
    const timeOrder = await Order.findAll({
      where: {
        storeId: myStore.id,
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.between]: arr,
        },
      },
      raw: true
    });

    let totalMerchantSales = 0;
    let merchantSales = 0;

    // 总销售额
    for (const iterator of totalOrder) {
      totalMerchantSales += iterator.amount;
    }
    // 月销售额 周销售额 日销售额
    for (const iterator of timeOrder) {
      merchantSales += iterator.amount;

    }
    // 返回查找的值
    const merchantData = {
      totalMerchantSales,
      merchantSales,
      timeOrder,
    };

    return merchantData;
  };

  // 取货
  /**
   * @param code 取货码
   */
  async draw(code) {
    const { ctx } = this;
    const { Order, Store } = ctx.model;
    const order = await Order.findOne({
      where: {
        code,
        status: 'fetch',
      },
    });
    if (!order) {
      await ctx.service.detection.error('nonentity');
    }
    // 找到当前店铺
    const store = await Store.findByPk(order.storeId);
    if (store.id !== order.storeId || code !== order.code) {
      await ctx.service.detection.error('notMatching');
    }
    switch (order.status) {
      case 'unpaid':
        await ctx.service.detection.error('unpaid');
        break;
      case 'paid':
        await ctx.service.detection.error('paid');
        break;
      case 'completed':
        await ctx.service.detection.error('completed');
        break;
      default:
        break;
    }
    // 更新订单状态
    await order.update({ status: 'completed' });
    return true;
  };
}

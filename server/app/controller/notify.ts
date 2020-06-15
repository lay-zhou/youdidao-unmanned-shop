// tslint:disable-next-line: no-var-requires
const Controller = require('egg').Controller;
import parser = require('xml2json');
import getRawBody = require('raw-body');
import moment = require('moment');
import urlencode = require('urlencode');

class NotifyController extends Controller {
  // 接收微信支付结果通知
  async wechatPay() {
    console.log('接收微信支付结果通知');
    const { ctx, app } = this;
    const { Trade, Order, User, OrderItem, Balance, Store, Point, Coupon, Phone } = ctx.model;
    const data = await getRawBody(ctx.req, {
      length: ctx.length,
      limit: '1mb',
      encoding: ctx.charset
    });
    const params = JSON.parse(parser.toJson(data));
    const { out_trade_no, total_fee } = params.xml;
    const trade = await Trade.findByPk(out_trade_no);
    const { price, status } = trade;
    if (Number(total_fee) === price) {
      if (status === 'unpaid') {
        console.log('status === unpaid');
        // 更新交易状态
        await trade.update({ status: 'paid' });
        console.log('更新了订单');

        const order = await Order.findByPk(trade.orderId);
        // 获取百度的 token
        const token = await app.redis.get('baiduAccessToken');
        console.log('token',token);
        if (token) {
          // 定义路径
          const nsp = app.io.of('/');
          const phone = await Phone.findOne({ where: { userId: order.userId } });
          // 定义文本
          let text = '';
          let number = 0;
          let tailNumber = '';
          let bindPhone = true;
          if (phone) {
            bindPhone = true;
            tailNumber = phone.number.substr(-4);
            let orderType = '';
            switch (order.type) {
              case 'distribution':
                orderType = '配送订单';
                break;
              case 'unmanned':
                orderType = '自提订单';
                break;
              case 'storeBuy':
                orderType = '直购订单';
                break;

              default:
                break;
            }
            // 找到订单内所有的商品
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            // 取出件数
            number = orderItems.reduce((total, item) => total + item.number, 0);
            // 定义文本
            text = `手机尾号为${tailNumber.split('').join(' ')}的${orderType}已支付，共计${number}件商品，金额${order.amount / 100}元。`;
          } else {
            bindPhone = false;
            tailNumber = order.id.substr(-4);
            let orderType = '';
            switch (order.type) {
              case 'distribution':
                orderType = '配送订单';
                break;
              case 'unmanned':
                orderType = '自提订单';
                break;
              case 'storeBuy':
                orderType = '直购订单';
                break;

              default:
                break;
            }
            // 找到订单内所有的商品
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            // 取出件数
            number = orderItems.reduce((total, item) => total + item.number, 0);
            // 定义文本
            text = `订单尾号为${tailNumber.split('').join(' ')}的${orderType}已支付，共计${number}件商品，金额${order.amount / 100}元。`;
          }
          // 定义所传数据
          const msg = {
            id: order.id,
            num: number,
            bindPhone,
            tailNumber,
            order,
            type: order.type,
            amount: order.amount,
            soundUrl: `https://tsn.baidu.com/text2audio?lan=zh&ctp=1&cuid=abcdxxx&tok=${token}&tex=${urlencode(text)}&vol=9&spd=5&pit=5`,
          };
          // 获取存储在redis中店铺的键值对
          const storeEquipment = await app.redis.get(`${order.storeId}`);
          // 传输给在线的客户端
          await nsp.to(storeEquipment).emit('online', {
            msg,
          });
        }
        // 更新交易状态
        switch (order.type) {
          case 'storeBuy':
            await order.update({ status: 'completed' });
            break;
          case 'distribution':
            await order.update({ status: 'paid' });
            break;
          case 'unmanned':
            await order.update({ status: 'fetch' });
            break;
          default:
            break;
        }
        const coupon = await Coupon.findOne({
          where: {
            orderId: order.id,
          }
        });
        console.log('coupon',coupon);
        if (coupon) await coupon.update({ usedAt: order.createdAt });
        console.log('coupon after',coupon);
        const orderItems = await OrderItem.findAll({
          where: {
            orderId: order.id,
          },
        });
        console.log('orderItems',orderItems);
        for (const iterator of orderItems) {
          console.log('iterator',iterator);
          await iterator.update({ status: 'completed' });
          // const item = await Item.findByPk(iterator.itemId);
          // await item.update({ stock: item.stock - iterator.number });
        }
        const store = await Store.findByPk(order.storeId);
        console.log('store',store);
        
        // 记录店铺收入
        await Balance.create({
          balance: store.balance + order.amount,
          price: order.amount,
          add: true,
          remark: '店铺收入',
          userId: order.userId,
          storeId: store.id,
          orderId: order.id,
        });
        await store.update({
          balance: store.balance + order.amount,
          sales: store.balance + order.amount,
        });
        // 找到当前用户
        const currentUser = await User.findByPk(order.userId);
        await ctx.service.paySuccess.send(order.id);
        //  记录购买积分
        await Point.create({
          point: currentUser.point + order.amount,
          price: order.amount,
          add: 'true',
          remark: '购买商品所得',
          userId: currentUser.id,
          orderId: order.id,
        });
        await currentUser.update({ point: currentUser.point + order.amount });
        if (order.pointDiscount && order.pointDiscount !== 0) {
          const point = order.pointDiscount * 100;
          await currentUser.update({ point: currentUser.point - point });
          //  记录消耗积分
          await Point.create({
            point: currentUser.point - point,
            price: point,
            add: false,
            remark: '购买商品消耗积分',
            userId: currentUser.id,
            orderId: order.id,
          });
        }
        if (currentUser.inviterId) {
          // 找到当前用户的邀请者
          const inviterUser = await User.findByPk(currentUser.inviterId);
          if (inviterUser && inviterUser.role === 'member') {
            await ctx.service.math.index(inviterUser.id, order.id);
          }
        }
      }
      app.wechatPay.success(this.ctx);
    }
  };
  // 接收微信充值结果通知
  async index() {
    console.log('接收微信充值结果通知');
    const { ctx, app } = this;
    const { TopUpTrade, User, Balance, TopUpOrder, Point } = ctx.model;
    const data = await getRawBody(ctx.req, {
      length: ctx.length,
      limit: '1mb',
      encoding: ctx.charset
    });
    const params = JSON.parse(parser.toJson(data));
    const { out_trade_no, total_fee } = params.xml;
    const trade = await TopUpTrade.findByPk(out_trade_no);
    if (Number(total_fee) === trade.price) {
      console.log('Number(total_fee) === trade.price');
      if (trade.status === 'unpaid') {
        // 更新充值订单状态
        await trade.update({ status: 'paid' });
        // 找到充值订单
        const order = await TopUpOrder.findByPk(trade.topUpOrderId);
        // 找到当前用户
        const user = await User.findByPk(order.userId);
        // 记录用户余额变动
        await Balance.create({
          balance: user.balance + order.amount,
          price: order.amount,
          add: true,
          remark: '用户充值',
          userId: order.userId,
          topUpOrderId: order.id,
        });
        console.log('记录用户余额变动');
        await user.update({ balance: user.balance + order.amount });

        //  记录购买积分
        await Point.create({
          point: user.point + order.givePoint,
          price: order.givePoint,
          add: 'true',
          remark: '充值赠送',
          userId: user.id,
          topUpOrderId: order.id,
        });
        await user.update({ point: user.point + order.givePoint });
        // 更新会员时间
        if (user.memberExpiredDate) {
          // 增加一年会员时间
          const memberExpiredDate = moment(user.memberExpiredDate).add(1, 'year').format('YYYYMMDD');
          await user.update({
            memberExpiredDate,
            role: 'member',
          });
          app.wechatPay.success(this.ctx);
        } else {
          // 增加一年会员时间
          const memberExpiredDate = moment().add(1, 'year').format('YYYYMMDD');
          await user.update({
            memberExpiredDate,
            role: 'member',
          });
          app.wechatPay.success(this.ctx);
        }
      }
    }
  }
}

module.exports = NotifyController;

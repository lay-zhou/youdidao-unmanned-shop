const Service = require('egg').Service;
import { ForbiddenError } from 'apollo-server';
import _ = require('lodash');
import urlencode = require('urlencode');

module.exports = class DisposeService extends Service {
    ctx: any;
    app: any;
    constructor(ctx) {
        super(ctx);
    }

    async wechat(input) {
        const { ctx } = this;
        const {
            Item,
            WechatAccount,
            Store,
            Coupon,
            Order,
            User,
            Config,
            Address,
            OrderItem,
        } = ctx.model;
        console.log('DisposeService input', input);

        // 找到店铺
        const store = await Store.findByPk(input.storeId);
        // 找到用户权限
        const user = await User.findByPk(ctx.state.user.sub);
        const items: any = [];
        const orderItem: any = [];
        if (user.role==='member') {
            // 循环创建订单内的商品
            for (const iterator of input.itemIds) {
                const item = await Item.findByPk(iterator.itemId);
                await orderItem.push({
                    fileKey: item.imageKey,
                    title: item.name,
                    price: item.memberPrice,
                    commission: item.commission,
                    amount: iterator.number * item.memberPrice,
                    number: iterator.number,
                    itemCode: item.code,
                });
                await items.push({
                    price: item.memberPrice,
                    pointDiscount: item.pointDiscountPrice,
                    number: iterator.number,
                });
            }
        }else{
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
                    pointDiscount: item.pointDiscountPrice,
                    number: iterator.number,
                });
            }
        }
        // 找到当前用户的 openId
        const wechatAccount = await WechatAccount.findOne({
            where: {
                userId: ctx.state.user.sub,
            },
        });
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
            // 支付类型
            type: input.type,
            discount: 0,
            pointDiscount: 0,
        };
        let code = '';
        for (let i = 0; i < 8; i++) {
            const num = Math.floor(Math.random() * 10);
            code += num;
        }
        data.code = code;
        if (input.couponId) {
            // 找到所传优惠券
            const coupon = await Coupon.findByPk(input.couponId);
            // 判断优惠券是否存在 且价格是否大于等于优惠券需求的价格
            if (coupon && data.amount >= coupon.require) {
                data.discount += coupon.amount;
                data.amount -= coupon.amount;
            }
        }
        if (input.pointDiscount) {
            console.log('input.pointDiscount === true');
            // 积分比例为： 消费1元得100积分 100积分可兑换0.01元
            // 计算出总可以抵扣的金额(钱  非积分)
            const pointDiscountAmount = items.reduce(
                (total, { pointDiscount, number }) => total + pointDiscount * number,
                0,
            );
            console.log('input.pointDiscount === true pointDiscountAmount', pointDiscountAmount);
            const { point } = await User.findByPk(wechatAccount.userId);
            console.log('input.pointDiscount === true point', point);
            // 用户积分大于总抵扣积分 
            if ((point / 100) >= pointDiscountAmount) {
                data.pointDiscount += pointDiscountAmount;
                data.amount -= pointDiscountAmount;
            } else {
                data.pointDiscount += point / 100;
                data.amount -= point / 100;
            }
            console.log('input.pointDiscount === true data', data);
        }

        switch (input.type) {
            case 'distribution':
                // 邮费相关
                const rel = await Config.findByPk('free');
                const cost = await Config.findByPk('cost');
                // 判断是否足够免运费的金额
                if (data.amount < rel.integer) {
                    data.amount += cost.integer;
                    data.freight = cost.integer;
                }
                break;

            default:
                break;
        }
        console.log('data data data data data', data);

        // 创建订单
        const order = await Order.create(_.pickBy(_.pick(
            data,
            [
                'price',
                'discount',
                'amount',
                'couponId',
                'userId',
                'storeId',
                'time',
                'code',
                'type',
                'payment',
                'discount',
                'freight',
                'pointDiscount',
            ]
        ), value => value !== null));
        if (order) {
            // 生成二维码并存储至阿里云
            await ctx.service.file.generateImage(order.id);
        }
        // 更新优惠券
        if (input.couponId) {
            // 找到所传优惠券
            const coupon = await Coupon.findByPk(input.couponId);
            if (coupon) {
                await coupon.update({ orderId: order.id });
            }
        }
        if (input.type === 'distribution') {
            const { receiverName, receiverPhone, receiverAddress } = input.address;
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
            const ordersitem = await OrderItem.create(iterator);
            console.log('ordersitem',ordersitem);
        }


        // 创建交易单号
        const { id: tradeId } = await order.createTrade({
            price: data.amount,
            orderId: order.id,
        });
        console.log('tradeId',tradeId);
        const ip = await ctx.get('x-real-ip');
        console.log('ip',ip);
        
        return await ctx.app.wechatPay.requestPayment({
            body: '购买商品',
            out_trade_no: String(tradeId),
            total_fee: order.amount,
            spbill_create_ip: ip,
            trade_type: 'JSAPI',
            openid: wechatAccount.openId,
        });
    };
    // 余额支付
    async balance(input) {
        const { ctx, app } = this;
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
            Phone,
        } = ctx.model;
        // 找到当前用户的 openId
        const wechatAccount = await WechatAccount.findOne({
            where: {
                userId: ctx.state.user.sub,
            },
        });

        // 找到店铺
        const store = await Store.findByPk(input.storeId);

        // 找到当前用户
        const user = await User.findByPk(wechatAccount.userId);

        // 取出商品的实际价格及数量
        const items: any = [];

        // 定义订单内的商品
        const orderItem: any = [];
        if (user.role==='member') {
            // 循环创建订单内的商品
            for (const iterator of input.itemIds) {
                const item = await Item.findByPk(iterator.itemId);
                await orderItem.push({
                    fileKey: item.imageKey,
                    title: item.name,
                    price: item.memberPrice,
                    commission: item.commission,
                    amount: iterator.number * item.memberPrice,
                    number: iterator.number,
                    itemCode: item.code,
                });
                await items.push({
                    price: item.memberPrice,
                    pointDiscount: item.pointDiscountPrice,
                    number: iterator.number,
                });
            }
        }else{
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
                    pointDiscount: item.pointDiscountPrice,
                    number: iterator.number,
                });
            }
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
            payment: input.payment,
            type: input.type,
            discount: 0,
            pointDiscount: 0,
        };
        if (input.pointDiscount) {
            console.log('input.pointDiscount === true');
            // 积分比例为： 消费1元得100分 100分可兑换0.01元
            // 计算出总可以抵扣的金额
            const pointDiscountAmount = items.reduce(
                (total, { pointDiscount, number }) => total + pointDiscount * number,
                0,
            );
            console.log('input.pointDiscount === true pointDiscountAmount', pointDiscountAmount);
            const { point } = await User.findByPk(wechatAccount.userId);
            console.log('input.pointDiscount === true point', point);
            // 用户积分大于总抵扣积分 
            if ((point / 100) >= pointDiscountAmount) {
                data.pointDiscount += pointDiscountAmount;
                data.amount -= pointDiscountAmount;
            } else {
                data.pointDiscount += point / 100;
                data.amount -= point / 100;
            }
            console.log('input.pointDiscount === true data', data);
        }
        switch (input.type) {
            case 'distribution':
                // 邮费相关
                const rel = await Config.findByPk('free');
                const cost = await Config.findByPk('cost');
                // 判断是否足够免运费的金额
                if (data.amount < rel.integer) {
                    data.amount += cost.integer;
                    data.freight = cost.integer;
                }
                break;

            default:
                break;
        }
        if (input.couponId) {
            // 找到所传优惠券
            const coupon = await Coupon.findByPk(input.couponId);
            // 判断优惠券是否存在 且价格是否大于等于优惠券需求的价格
            if (coupon && data.amount >= coupon.require) {
                data.discount += coupon.amount;
                data.amount -= coupon.amount;
            }
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
                'time',
                'code',
                'type',
                'payment',
                'discount',
                'freight',
                'pointDiscount',
            ]), value => value !== null));
        if (order) {
            // 生成二维码并存储至阿里云
            await ctx.service.file.generateImage(order.id);
        }
        // 更新优惠券
        if (input.couponId) {
            // 找到所传优惠券
            const coupon = await Coupon.findByPk(input.couponId);
            if (coupon) {
                await coupon.update({ orderId: order.id });
            }
        }
        if (input.type === 'distribution') {
            const { receiverName, receiverPhone, receiverAddress } = input.address;
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
        // 若用户的余额大于等于订单的总价
        if (user.balance >= order.amount) {
            // 更新交易状态
            switch (order.type) {
                case 'storeBuy':
                    await trade.update({ status: 'paid' });
                    await order.update({ status: 'completed' });
                    break;
                case 'distribution':
                    await trade.update({ status: 'paid' });
                    await order.update({ status: 'paid' });
                    break;
                case 'unmanned':
                    await trade.update({ status: 'paid' });
                    await order.update({ status: 'fetch' });
                    break;

                default:
                    break;
            }

            // 获取百度的 token
            const token = await app.redis.get('baiduAccessToken');
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
                            orderType = '门店订单';
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
                    number,
                    tailNumber,
                    bindPhone,
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
                if (inviterUser && inviterUser.role === 'member') {
                    await ctx.service.math.index(inviterUser.id, order.id);
                }
            }
            return true;
        } else {
            throw new ForbiddenError('余额不足！');
        }
    };

}
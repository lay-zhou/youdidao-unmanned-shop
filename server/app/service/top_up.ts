import { Service } from 'egg';
const Payment = require('wechat-pay').Payment;

module.exports = class RefundService extends Service {
    ctx: any;
    app: any;

    constructor(ctx) {
        super(ctx);
    }

    // 充值
    /**
     * 
     * @param id 充值金额的ID
     */
    async index(id) {
        console.log('service index params order', id);
        const { ctx } = this;
        const { WechatAccount, TopUp, TopUpTrade, TopUpOrder } = ctx.model;
        const initConfig = {
            partnerKey: 'aR5kF8Fwa27S2ZMs2Szn3kQsZNSMwOgk',
            appId: 'wxf26f1059f2f9fbf1',
            mchId: '1508510951',
            notifyUrl: 'https://youdidao.seawhale.cn/notify/index',
        };
        const { openId: openid } = await WechatAccount.findOne({
            where: {
                userId: ctx.state.user.sub,
            },
        });

        const { price: total_fee, givePoint } = await TopUp.findByPk(id);
        // 创建订单
        const { id: topUpOrderId } = await TopUpOrder.create({
            amount: total_fee,
            givePoint,
            userId: ctx.state.user.sub,
        });
        
        const { id: out_trade_no } = await TopUpTrade.create({
            price: total_fee,
            topUpOrderId,
        });

        const payment = new Payment(initConfig);
        const order = {
            body: '用户充值',
            out_trade_no,
            total_fee,
            spbill_create_ip: ctx.get('x-real-ip'),
            openid,
            trade_type: 'JSAPI',
        };
        const payargs = await payment.getBrandWCPayRequestParams(order);
        ctx.status = 200;
        return payargs;

    }
};

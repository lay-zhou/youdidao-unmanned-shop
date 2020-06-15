import { Service } from 'egg';
import moment = require('moment');
export default class PaySuccess extends Service {

    async send(orderId) {
        const { ctx } = this;

        const { WechatAccount, Order, OrderItem } = ctx.model;

        const { updatedAt, userId, amount } = await Order.findByPk(orderId);

        const orderItems = await OrderItem.findAll({
            where: {
                orderId
            }
        });
        const arr: any = [];

        let sum = 0;

        for (const iterator of orderItems) {

            arr.push(iterator.title);

            sum += iterator.number;

        };

        const title = `${arr[0]}等${sum}件商品`;

        // 拿到用户的openId
        const { openId: touser } = await WechatAccount.findOne({
            where: {
                userId
            }
        });
        // 生成token
        const ACCESS_TOKEN = await ctx.service.token.generateAccessToken();

        const uri = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`;

        const result = await this.ctx.curlPost(uri, {
            touser,
            template_id: '8_r9fJI0Qwz326pRDZHgVPci3nn93sZBGCoaWNhaoLE',
            page: 'pages/home/index',
            data: {
                // 订单号码
                number1: { value: orderId },

                // 支付时间
                date3: { value: moment(updatedAt).format('YYYY/MM/DD') },

                // 商品名称
                thing4: { value: title },

                // 商家名称
                thing5: { value: '有地道' },

                // 订单金额
                amount2: { value: amount },
            },
        });

        console.log('app service PaySuccess result', result);

    };

}

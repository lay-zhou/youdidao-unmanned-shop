import { Service } from 'egg';

export default class MathService extends Service {
    /**
     * @param inviterId 
     * @param orderId 
     */
    async index(inviterId, orderId) {
        const { ctx } = this;
        const { User, Order, OrderItem, Balance } = ctx.model;
        // 找到当前用户的邀请者
        const inviterUser = await User.findByPk(inviterId);
        // 找到当前这笔订单
        const order = await Order.findByPk(orderId);
        // 找到当前这笔订单所有商品
        const orderItems = await OrderItem.findAll({
            where: {
                orderId: order.id,
            },
            raw: true,
        });
        // 计算出总佣金
        const amount = orderItems.reduce(
            (total, { commission, number }) =>
                total + commission * number,
            0,
        );
        await Balance.create({
            balance: inviterUser.balance + amount,
            price: amount,
            add: true,
            remark: '佣金收入',
            userId: inviterUser.id,
            storeId: order.storeId,
            orderId: order.id,
        });
        await inviterUser.update({
            recordBalance: inviterUser.recordBalance + amount,
            balance: inviterUser.balance + amount
        });
    }
}

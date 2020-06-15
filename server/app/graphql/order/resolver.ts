export const Query = {
    // 订单列表
    async orders(_root, { input }, ctx) {
        return await ctx.service.order.fetch(input);
    },
    // 单个订单
    async order(_root, { id }, { model, service }) {
        const { Order } = model;
        const result = await Order.findByPk(id);
        if (result.code) {
            result.qrCode = await service.file.generatePrivateDownloadUrl(`${result.id}.png`);
        } else {
            result.qrCode = null;
        }
        if (!result) await service.detection.error('nonentity');
        return result;
    },
    // 距离计算
    async distanceCalculation(_root, { input }, { service }) {
        return await service.store.calculation(input);
    },
    // 详细订单
    async merchantOrder(_root, { time }, { service }, info) {
        await service.user.authenticate(info);
        return await service.order.timeOrder(time);
    },

    // app订单管理
    async orderManage(_root, _params, { model, state, service }, info) {

        await service.user.authenticate(info);

        const { Order, Store, Op } = model;

        const { id: storeId } = await Store.findOne({
            where: {
                userId: state.user.sub,
            }
        });
        const distribution = await Order.count({
            where: {
                status: { [Op.not]: 'unpaid' },
                storeId,
                type: 'distribution',
            },
        });

        const unmanned = await Order.count({
            where: {
                status: { [Op.not]: 'unpaid' },
                storeId,
                type: 'unmanned',
            },
        });

        const storeBuy = await Order.count({
            where: {
                status: { [Op.not]: 'unpaid' },
                storeId,
                type: 'storeBuy',
            },
        });

        return { distribution, unmanned, storeBuy };
    },

    async fetchOrderForCode(_root, { code }, ctx, info) {

        await ctx.service.user.authenticate(info);

        const order = await ctx.model.Order.findOne({
            where: {
                code,
                status: 'fetch',
            },
        });
        if (!order) {
            await ctx.service.detection.error('nonentity');
        }

        return order;

    }
};

export const Mutation = {
    // 创建订单
    async createOrder(_root, { input }, ctx) {
        // 判断支付类型
        switch (input.payment) {
            case 'wechatPay':
                return ctx.service.dispose.wechat(input);
            case 'balance':
                return ctx.service.dispose.balance(input);
            default:
                break;
        }

    },

    // 创建订单
    async createBalanceOrder(_root, { input }, ctx) {
        input.payment = 'balance';
        await ctx.service.dispose.balance(input);

        return true;

    },

    // 取货
    async drawItem(_root, { code }, ctx) {
        return await ctx.service.order.draw(code);
    },

    // 备货完成
    async updateOrderStatus(_root, { id, name, phone }, { model }) {
        const { Order, DistributionUser } = model;
        const order = await Order.findByPk(id);
        await order.update({ status: 'fetch' });
        if (name && phone) {
            await DistributionUser.create({
                name,
                phone,
                orderId: order.id,
            })
        };
        return true;
    },
};

export const Point = {
    async order({ orderId }, _params, { model }) {
        const { Order } = model;
        return await Order.findByPk(orderId);
    },
};

export const Balance = {
    async balanceOrder({ orderId }, _params, { model }) {
        const { Order } = model;
        return await Order.findByPk(orderId);
    },
};

export const Order = {
    async distributionUser({ id: orderId }, _params, { model }) {
        const { DistributionUser } = model;
        return await DistributionUser.findOne({
            orderId,
        });
    }
}

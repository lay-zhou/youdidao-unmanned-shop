import _ = require('lodash');

export const Query = {
    // 充值列表
    async topUpList(_root, _params, { model }) {

        const { TopUp } = model;

        return await TopUp.findAll({ raw: true });
    },
    // 单个充值
    async topUp(_root, { id }, { model }) {

        const { TopUp } = model;

        return await TopUp.findByPk(id);
    },
};

export const Mutation = {
    // 创建充值
    async createTopUp(_root, { input }, { model, service }, info) {

        // 进行鉴权
        await service.user.authenticate(info);

        const { TopUp } = model;

        return await TopUp.create(_.pickBy(
            _.pick(
                input,
                ['price', 'givePoint']),
            value => value !== null,
        ));
    },

    // 更新充值
    async updateTopUp(_root, { input }, { model, service }, info) {

        // 进行鉴权
        await service.user.authenticate(info);

        const { TopUp } = model;

        // 找到该项充值
        const item = await TopUp.findByPk(input.id);

        // 更新该项
        await item.update(_.pickBy(
            _.pick(
                input,
                ['price', 'givePoint']),
            value => value !== null,
        ));

        return item;
    },

    // 删除充值
    async deleteTopUp(_root, { id }, { model, service }, info) {

        // 进行鉴权
        await service.user.authenticate(info);

        const { TopUp } = model;

        // 找到该项
        const item = await TopUp.findByPk(id);

        // 删除该项
        if (item) {

            await item.destroy();

            return true;

        } else {

            return false;

        }
    },

    async userTopUp(_root, { id }, { service }) {
        return await service.topUp.index(id);
    }

};

export const Point = {
    async topUpOrder({ topUpOrderId }, _params, { model }) {
        const { TopUpOrder } = model;
        return await TopUpOrder.findByPk(topUpOrderId);
    }
};


export const Balance = {
    async topUpOrder({ topUpOrderId }, _params, { model }) {
        const { TopUpOrder } = model;
        return await TopUpOrder.findByPk(topUpOrderId);
    }
};
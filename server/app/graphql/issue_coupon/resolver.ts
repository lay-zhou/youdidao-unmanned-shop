export const Query = {
    // 获取列表
    async issueCoupon(_root, { type }, { service }) {
        return await service.issueCoupon.fetch(type);
    }
};

export const Mutation = {
    // 创建优惠券
    async createIssueCoupon(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.issueCoupon.add(input);
    },

    // 更新优惠券
    async updateIssueCoupon(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.issueCoupon.update(input);
    },

    // 删除优惠券
    async deleteIssueCoupon(_root, { id }, { service }, info) {
        await service.user.authenticate(info);
        return await service.issueCoupon.remove(id);
    },
};
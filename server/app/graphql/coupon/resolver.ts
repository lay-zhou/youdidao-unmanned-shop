export const Query = {
    //  获取优惠券列表
    coupons(_root, { input }, { service }) {
        return service.coupon.fetchAll(input);
    },
};

export const Mutation = {
    // 领取优惠券
    drawCoupon(_root, { id }, { service }) {
        return service.coupon.create(id);
    },
};

export const Order = {
    // 订单使用的优惠券
    async coupon({ id: couponId }, _params, { model }) {
        const { Coupon } = model;
        return await Coupon.findByPk(couponId);
    }
};

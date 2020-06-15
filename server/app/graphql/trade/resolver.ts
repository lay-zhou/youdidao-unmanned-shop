export const Order = {
    // 订单内的商品
    async trade({ id: orderId }, _params, { model }) {
        const { Trade } = model;
        return await Trade.findOne({
            where: {
                orderId,
            },
            raw: true,
        });
    }
}
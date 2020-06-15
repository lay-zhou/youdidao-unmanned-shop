export const Order = {
    // 订单内的地址
    async address({ id: orderId }, _params, { model }) {
        const { Address } = model;
        return await Address.findOne({
            where: {
                orderId,
            },
            raw: true,
        });
    }
}
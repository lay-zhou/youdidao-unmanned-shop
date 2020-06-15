export const Order = {
    // 订单内的商品
    async orderItem({ id: orderId }, _params, { model, service }) {
        const { OrderItem } = model;
        const result = await OrderItem.findAll({
            where: {
                orderId,
            },
            raw: true,
        });
        const list: any = [];
        for (const iterator of result) {
            iterator.imageUrl = await service.file.generatePrivateDownloadUrl(iterator.fileKey);
            await list.push(iterator);
        }
        return list;
    }
}
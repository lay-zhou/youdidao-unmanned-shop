import { Service } from 'egg';

module.exports = class BalanceService extends Service {
    ctx: any;
    app: any;
    constructor(ctx) {
        super(ctx);
    }
    // 获取
    async fetch(params) {
        const { ctx } = this;
        let pageSize = 10;
        if (params.pageSize) pageSize = Number(params.pageSize);
        const where: any = {};
        const options = {
            limit: pageSize,
            offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
            order: [['createdAt', 'DESC']],
            where,
            raw: true,
        };
        const { count: total, rows: list } = await ctx.model.Card.findAndCountAll(
            options,
        );
        return {
            list,
            pagination: {
                total,
                pageSize,
                current: parseInt(params.currentPage, 10) || 1,
            },
        };
    }
};

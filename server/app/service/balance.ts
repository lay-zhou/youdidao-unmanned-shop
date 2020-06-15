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
        const user = await ctx.model.User.findByPk(ctx.state.user.sub);
        switch (user.role) {
            case 'merchant':
                const store = await ctx.model.Store.findOne({ where: { userId: user.id } });
                where.storeId = store.id;
                break;
            case 'member':
                where.userId = user.id;
                break;
            case 'user':
                where.userId = user.id;
                break;
            default:
                break;
        }
        const options = {
            limit: pageSize,
            offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
            order: [['id', 'DESC']],
            where,
            raw: true,
        };
        const { count: total, rows: list } = await ctx.model.Balance.findAndCountAll(
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

    // 获取
    async fetches(params) {
        const { ctx } = this;
        let pageSize = 10;
        if (params.pageSize) pageSize = Number(params.pageSize);
        const where: any = {};
        if (params.storeId) {
            where.storeId = params.storeId;
        }
        const options = {
            limit: pageSize,
            offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
            order: [['id', 'DESC']],
            where,
        };
        const { count: total, rows: list } = await ctx.model.Award.findAndCountAll(
            options,
        );
        for (const value of list) {
            await value.update({ view: 'true' });
        }
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

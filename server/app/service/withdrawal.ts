import { Service } from 'egg';

module.exports = class WithdrawalService extends Service {
  ctx: any;
  app: any;
  constructor(ctx) {
    super(ctx);
  }
  // 获取
  async fetch(params) {
    const { ctx } = this;
    let pageSize = 10;
    if (params && params.pageSize) pageSize = Number(params.pageSize);
    const where: any = {};
    const { status, userId, type } = params;
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    const user = await ctx.model.User.findByPk(ctx.state.user.sub);
    switch (user.role) {
      case 'facilitator':
        where.userId = user.id;
        break;
      case 'agent':
        where.userId = user.id;
        break;
      case 'member':
        where.userId = user.id;
        break;
      case 'merchant':
        where.userId = user.id;
        break;
      default:
        break;
    }
    const options = {
      limit: pageSize,
      offset: params && params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [['id', 'DESC']],
      where,
      raw: true,
    };
    const { count: total, rows: list } = await ctx.model.Withdrawal.findAndCountAll(
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
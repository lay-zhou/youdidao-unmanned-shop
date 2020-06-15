import { Service } from 'egg';

module.exports = class PointService extends Service {
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
    const { id, userId } = params;
    if (id) where.id = id;
    const user = await ctx.model.User.findByPk(ctx.state.user.sub);
    switch (user.role) {
      case 'user':
        where.userId = user.id;
        break;
        case 'member':
        where.userId = user.id;
        break;

      default:
        break;
    }
    if (userId) where.userId = userId;
    const options = {
      limit: pageSize,
      offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [
        ['id', 'DESC'],
      ],
      raw: true,
      where,
    };
    const {
      count: total, rows: list,
    } = await ctx.model.Point.findAndCountAll(options);
    return {
      list,
      pagination: {
        total,
        pageSize,
        current: parseInt(params.currentPage, 10) || 1,
      },
    };
  };
}

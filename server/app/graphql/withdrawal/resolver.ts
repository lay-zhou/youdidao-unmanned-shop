import moment = require('moment');

export const Query = {
  async withdrawals(_root, { userId, status, type, pageSize, currentPage }, ctx, info) {
    await ctx.service.user.authenticate(info);
    const params = { userId, status, pageSize, currentPage, type };
    const result = await ctx.service.withdrawal.fetch(params);
    const newList: any = [];
    const resultList = result.list;
    for (const iterator of resultList) {
      iterator.createdAt = moment(new Date(iterator.createdAt)).format('YYYY-MM-DD, h:mm:ss').replace(/-/g, '/');
      iterator.updatedAt = moment(new Date(iterator.updatedAt)).format('YYYY-MM-DD, h:mm:ss').replace(/-/g, '/');
      newList.push(iterator);
    }
    result.list = newList;
    return result;
  }
};
export const Mutation = {
  async audit(_root, { id }, ctx, info) {
    const { Withdrawal } = ctx.model;
    await ctx.service.user.authenticate(info);
    const item = await Withdrawal.findByPk(id);
    await item.update({ status: 'success' });
    return true;
  },
  // 审核
  async passAudit(_root, { id, status }, ctx, info) {
    const { Withdrawal, User, Store } = ctx.model;
    await ctx.service.user.authenticate(info);
    const item = await Withdrawal.findByPk(id);
    if (status === 'refuse') {
      const { price, userId, type } = item;
      const user = await User.findByPk(userId);
      if (type === 'store') {
        const store = await Store.findByPk(item.storeId);
        await store.update({ balance: store.balance + price });
        await item.update({ status: 'refuse' });
        return true;
      } else {
        await user.update({ balance: user.balance + price });
        await item.update({ status: 'refuse' });
        return true;
      }
    } else {
      await item.update({ status: 'audit' });
      return true;
    }
  }
}
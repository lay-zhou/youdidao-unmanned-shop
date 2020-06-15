export const Query = {
  async items(_params,
    { storeId, pageSize, currentPage, itemClassId, status, projectId, nameLike, type, stateless },
    { service }) {
    const params = { pageSize, currentPage, itemClassId, status, projectId, nameLike, type, stateless, storeId };
    return await service.item.fetch(params);
  },

  // 单个商品
  async item(_root, { code }, { model, service, state }) {
    const { Item, User } = model;
    const item = await Item.findByPk(code);
    item.imageUrl = await service.file.generatePrivateDownloadUrl(item.imageKey);
    
    if (state.user) {
      const user = await User.findByPk(state.user.sub);
      if (user) {
        const followed = await item.hasUser(user);
        if (followed) {
          item.followed = true;
        } else {
          item.followed = false;
        }
      } else {
        item.followed = false;
      }
    } else {
      item.followed = false;
    }

    return item;
  },
};

export const Mutation = {
  // 创建商品
  async createItem(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return await service.item.create(input);
  },

  // 更新商品
  async updateItem(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return await service.item.update(input);
  },

  // 删除商品
  async deleteItem(_root, { code }, { service }, info) {
    await service.user.authenticate(info);
    return await service.item.remove(code);
  },

  // 商品上架下架
  async updateItemStatus(_root, { input }, { model, service }, info) {
    await service.user.authenticate(info);
    const { Item } = model;
    const item = await Item.findByPk(input.code);
    await item.update({ status: input.status });
    return true;
  },

  // 更新商品专题相关
  async updateItemToProject(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return await service.item.updateItem(input);
  },

  async testUpdate(_root, { itemClassifyId }, ctx) {
    const { Item } = ctx.model;
    const items = await Item.findAll({
      where: { status: 'draft' }
    });
    if (items) {
        for (const iterator of items) {
            await iterator.update({ itemClassifyId });
        }
        return true;
    }
}
};
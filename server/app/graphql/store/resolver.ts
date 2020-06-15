export const Query = {
  // 店铺列表
  async stores(_params,
    { pageSize, currentPage, status },
    { service }) {
    const params = { pageSize, currentPage, status };
    return await service.store.fetch(params);
  },

  // 根据地址获取店铺列表
  async nearbyStore(_root, { input }, { service }) {
    return await service.store.near(input);
  },

  // 查找单个店铺
  async store(_root, { id }, { model, service }) {
    const { Store } = model;
    const store = await Store.findByPk(id);
    store.imageUrl = await service.file.generatePrivateDownloadUrl(store.imageKey);
    return store;
  },

  // 
  async appHomeData(_root, _params, { model, service, state }, info) {
    await service.user.authenticate(info);

    const { Order, User, Store, Op } = model;

    const { id: userId } = await User.findByPk(state.user.sub);

    const { id: storeId } = await Store.findOne({ where: { userId }, raw: true });

    const orders = Order.findAll({
      where: {
        storeId,
        status: {
          [Op.not]: 'unpaid',
        },
      },
      raw: true,
    });
    // 计算出总销售额
    const allAmount = orders.reduce((total, order) => total + order.amount, 0);

    const newOrders = await Order.findAll({
      where: {
        storeId,
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(Number(new Date()) - 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    });

    // 计算出总销售额
    const newAmount = newOrders.reduce((total, order) => total + order.amount, 0);

    // 订单总数
    const total = await Order.count({
      where: {
        storeId,
        status: {
          [Op.not]: 'unpaid',
        },
      },
    });

    return { allAmount, newAmount, total };

  },



  // 我的店铺
  async myStore(_root, _params, ctx, info) {
    await ctx.service.user.authenticate(info);
    const { User, Store } = ctx.model;
    const { id } = await User.findByPk(ctx.state.user.sub);
    return await Store.findOne({ where: { userId: id } });
  },

  // 地址解析
  async addressToLngAndLat(_root, { address }, { service }) {
    return await service.store.addressResolution(address);
  },

  async financial(_root, _params, { model, state, service }, info) {

    await service.user.authenticate(info);

    const { Store, Order, Op } = model;

    const { id: storeId, sales, balance } = await Store.findOne({
      where: {
        userId: state.user.sub,
      },
    });

    const order = await Order.findAll({
      where: {
        storeId,
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(Number(new Date()) - 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    });
    // 计算出新销售额
    const newAmount = order.reduce((total, order) => total + order.amount, 0);

    return { sales, balance, newAmount };
  },
};

export const Mutation = {
  // 创建店铺
  async createStore(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return service.store.create(input);
  },
  // 更新店铺
  async updateStore(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return service.store.update(input);
  },
  // 删除店铺
  async deleteStore(_root, { id }, { model, service }, info) {
    await service.user.authenticate(info);
    const { Store } = model;
    const store = await Store.findByPk(id);
    await store.destroy();
    return true;
  },
  // 店铺上架下架
  async updateStoreStatus(_root, { input }, { model, service }, info) {
    await service.user.authenticate(info);
    const { Store } = model;
    const store = await Store.findByPk(input.id);
    await store.update({ status: input.status });
    return true;
  }
};

export const Order = {
  async store({ storeId }, _params, { model }) {
    const { Store } = model;
    return await Store.findByPk(storeId);
  }
};

export const Balance = {
  async balanceStoreInfo({ storeId }, _params, { model }) {
    const { Store } = model;
    return await Store.findByPk(storeId);
  }
}
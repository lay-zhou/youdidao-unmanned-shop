import { Service } from 'egg';
import _ = require('lodash');

module.exports = class ItemService extends Service {
  ctx: any;
  app: any;
  constructor(ctx) {
    super(ctx);
  }
  // 获取列表
  async fetch(params) {
    const { ctx } = this;
    const { Item, Op, User, Store } = ctx.model;
    const { service } = this;
    let pageSize = 10;
    if (params && params.pageSize) pageSize = Number(params.pageSize);
    const where: any = {};
    where.status = 'published';
    const { itemClassId, status, projectId, nameLike, type, stateless, storeId } = params;
    if (status) where.status = status;
    if (nameLike) where.name = { [Op.like]: `%${nameLike}%` };
    if (storeId) {
      const { type } = await Store.findByPk(storeId);
      if (type === 'special') {
        where.kind = 'special';
      }
    }

    if (itemClassId) {
      where.itemClassifyId = itemClassId;
      where.status = 'published';
    }
    if (projectId) {
      where.projectId = projectId;
      where.status = 'published';
    }
    if (stateless) {
      where.projectId = null;
    }
    const options: any = {
      limit: pageSize,
      offset: params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [
        ['createdAt', 'DESC'],
      ],
      raw: true,
      where,
    };
    if (type) {
      const user = await User.findByPk(ctx.state.user.sub);
      options.include = [{
        as: 'users',
        model: User,
        where: { id: user.id },
      }];
    }
    const {
      count: total, rows: list,
    } = await Item.findAndCountAll(options);
    const newList: any = [];
    for (const iterator of list) {
      if (iterator.imageKey) {
        iterator.imageUrl = await service.file.generatePrivateDownloadUrl(iterator.imageKey);
        await newList.push(iterator);
      } else {
        iterator.imageUrl = null;
        await newList.push(iterator);
      }
    };
    return {
      list: newList,
      pagination: {
        total,
        pageSize,
        current: parseInt(params.currentPage, 10) || 1,
      },
    };
  };

  // 获取单个
  async findById(id) {
    const { ctx } = this;
    const { Item, Order } = this.ctx.model;
    // 找到当前店铺的信息
    const result = await Item.findByPk(id);
    const currentUser = await ctx.model.User.findByPk(ctx.state.user.sub);
    const followed = await result.hasUser(currentUser);
    const sentiment = await Order.count({
      where: {
        storeId: result.id,
      },
    });
    result.sentiment = sentiment;
    result.followed = followed;
    if (result.imageKey) {
      result.imageUrl = await this.ctx.service.file.generatePrivateDownloadUrl(result.imageKey);
    } else {
      result.imageUrl = null;
    }
    const orders = await Order.findAll({
      where: {
        storeId: result.id,
        status: { [ctx.model.Op.not]: 'unpaid' },
      },
    });
    // 即为总销售额
    let sales = 0;
    for (const iterator of orders) {
      const { amount } = iterator;
      sales += amount;
    }
    result.sales = sales;
    return result;
  };

  // 创建
  async create(input) {
    console.log('create input',input);
    
    const { ctx } = this;
    const { Item, ItemImage } = ctx.model;
    // 创建商品
    const item = await Item.create(_.pickBy(
      _.pick(
        input,
        [
          'code',
          'imageKey',
          'name',
          'content',
          'pointDiscountPrice',
          'originalPrice',
          'memberPrice',
          'price',
          'unit',
          'stock',
          'commission',
          'itemClassifyId',
          'type',
          'kind',
        ]
      ),
      value => value !== null
    ));
    if (input.itemImages) {
      // 批量创建商品图片
      const { itemImages } = input;
      await ItemImage.bulkCreate(itemImages.map(e => ({
        imageKey: e.imageKey,
        itemCode: item.code,
      })));
    }
    return item;
  };

  // 修改
  async update(input) {
    const { ctx } = this;
    const { Item, ItemImage } = ctx.model;
    const item = await Item.findByPk(input.code);
    await item.update(_.pickBy(
      _.pick(
        input,
        [
          'code',
          'imageKey',
          'name',
          'content',
          'pointDiscountPrice',
          'originalPrice',
          'memberPrice',
          'price',
          'unit',
          'stock',
          'kind',
          'type',
          'commission',
          'itemClassifyId',
        ]
      ),
      value => value !== null
    ));
    if (input.itemImages) {
      const { itemImages } = input;
      for (const iterator of itemImages) {
        const { id, imageKey } = iterator;
        const result = await ItemImage.findByPk(id);
        await result.update({ imageKey });
      };
    };
    return item;
  };

  // 删除
  async remove(code) {
    const { ctx } = this;
    const { Item, ItemImage } = ctx.model;
    const item = await Item.findByPk(code);
    const itemImages = await ItemImage.findAll({
      where: {
        itemCode: item.code,
      },
    });
    for (const iterator of itemImages) {
      await iterator.destroy();
    }
    await item.destroy();
    return true;
  };

  // 将商品添加至专题
  async updateItem(input) {
    const { model, service } = this.ctx;
    const { Item, Project } = model;
    // 找到该商品
    const item = await Item.findByPk(input.itemCode);
    // 找到该专题
    const project = await Project.findByPk(input.projectId);
    if (!item || !project) await service.detection.error('codeErr');
    if (input.type === 'add') {
      await item.update({ projectId: project.id });
      return true;
    } else if (input.type === 'remove') {
      await item.update({ projectId: null });
      return true;
    }
  };
}

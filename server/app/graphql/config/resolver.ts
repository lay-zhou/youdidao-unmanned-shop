import _ = require('lodash');
import { ForbiddenError } from 'apollo-server';

export const Query = {
  //  获取优惠券列表
  async configs(_root, _params, { model }) {
    const { Config } = model;
    const configs = await Config.findAll({ raw: true });
    const item = configs.map(config => ({
      ..._.pick(
        config,
        ['key', 'name', 'type']
      ),
      value: config[config.type],
    }));
    return item;
  },
  // 系统配置
  async config(_root, { primaryKey }, ctx) {
    const { Config } = ctx.model;
    const item = await Config.findByPk(primaryKey);
    if (!item) throw new ForbiddenError('该配置不存在！');
    item.value = item[item.type];
    return item;
  },
};


export const Mutation = {
  // 修改配置
  async updateConfig(_root, { primaryKey, value }, ctx) {
    const { Config } = ctx.model;
    const item = await Config.findByPk(primaryKey);
    if (!item) throw new ForbiddenError('该配置不存在！');
    await item.update({ [item.type]: value });
    return item;
  }
}
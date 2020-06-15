export const Query = {
  //  获取优惠券列表
  async banners(_root, { position }, { service }) {
    return await service.banner.fetch(position);
  },
};

export const Mutation = {
  // 添加图片
  async addBanner(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return await service.banner.add(input);
  },

  // 修改图片
  async updateBanner(_root, { input }, { service }, info) {
    await service.user.authenticate(info);
    return await service.banner.update(input);
  },
  // 删除图片
  async deleteBanner(_root, { id }, { service }, info) {
    await service.user.authenticate(info);
    return await service.banner.delete(id);

  }
};


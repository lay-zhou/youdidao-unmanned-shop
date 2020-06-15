export const Query = {
    // 获取列表
    async classify(_root, _params, { service }) {
        return await service.itemClassify.fetch();
    }
};

export const Mutation = {
    // 创建商品分类
    async createClassify(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.itemClassify.add(input);
    },

    // 更新商品分类
    async updateClassify(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.itemClassify.update(input);
    },
    
    // 删除商品分类
    async deleteClassify(_root, { id }, { service }, info) {
        await service.user.authenticate(info);
        return await service.itemClassify.remove(id);
    },
};
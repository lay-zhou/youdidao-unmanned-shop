export const Query = {
    // 专题列表
    async projects(_root, _params, { service }) {
        return await service.project.fetch();
    },

    // 单个专题
    async project(_root, { id }, { service }) {
        return await service.project.fetchById(id);
    },
};

export const Mutation = {
    // 创建专题
    async createProject(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.project.add(input);
    },

    // 更新专题
    async updateProject(_root, { input }, { service }, info) {
        await service.user.authenticate(info);
        return await service.project.update(input);
    },

    // 删除专题
    async deleteProject(_root, { id }, { service }, info) {
        await service.user.authenticate(info);
        return await service.project.remove(id);
    },
};
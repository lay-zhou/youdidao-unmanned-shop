export const Query = {
    // 查询banner
    points(_root, { id, userId, pageSize, currentPage }, ctx) {
        const params = { id, userId, pageSize, currentPage };
        return ctx.service.point.fetch(params);
    },
};

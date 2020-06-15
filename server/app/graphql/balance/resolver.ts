import moment = require('moment');

export const Query = {
    // 查询金额变动记录
    async balance(_root, { currentPage }, ctx) {
        const params = { currentPage };
        const result = await ctx.service.balance.fetch(params);
        const newList: any = [];
        const resultList = result.list;
        for (const iterator of resultList) {
            if (iterator.remark !== '店铺收入') {
                iterator.createdAt = await moment(new Date(iterator.createdAt)).format('YYYY-MM-DD, h:mm:ss').replace(/-/g, '/');
                iterator.updatedAt = await moment(new Date(iterator.updatedAt)).format('YYYY-MM-DD, h:mm:ss').replace(/-/g, '/');
                newList.push(iterator);
            }
        }
        result.list = newList;
        return result;
    }
};
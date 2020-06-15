const Subscription = require('egg').Subscription;
const moment = require('moment');

class UpdateCache extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            // 配置了该参数为 true 时，这个定时任务会在应用启动并 ready 后立刻执行一次这个定时任务。
            immediate: true,
            // 定时任务的执行时机，定时任务将会按照 cron 表达式在特定的时间点执行。cron 表达式通过 cron-parser 进行解析
            // *    *    *    *    *    *
            // ┬    ┬    ┬    ┬    ┬    ┬
            // │    │    │    │    │    |
            // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
            // │    │    │    │    └───── month (1 - 12)
            // │    │    │    └────────── day of month (1 - 31)
            // │    │    └─────────────── hour (0 - 23)
            // │    └──────────────────── minute (0 - 59)
            // └───────────────────────── second (0 - 59, optional)
            cron: '0 0 3 * * *',
            // 每台机器上只有一个 worker 会执行这个定时任务，每次执行定时任务的 worker 的选择是随机的
            type: 'worker',
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        console.log('执行会员查询到期操作');
        const { User } = this.ctx.model;
        // 查找所有会员用户
        const users = await User.findAll({ where: { role: 'member' } });
        for (const iterator of users) {
            // 获取当前时间
            const date = moment().format('YYYYMMDD');
            // 取出会员到期时间
            const { memberExpiredDate } = iterator;
            // 判断当前时间是否大于会员到期时间
            if (date > memberExpiredDate) {
                // 更新用户的角色类型
                await iterator.update({
                    role: 'user',
                    memberExpiredDate: null,
                });
            }
        }
        console.log('执行会员查询操作成功！');
    }
}

module.exports = UpdateCache;
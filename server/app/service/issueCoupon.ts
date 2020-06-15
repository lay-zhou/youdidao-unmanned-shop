import { Service } from 'egg';
import _ = require('lodash');

export default class IssueCouponService extends Service {
    // 获取列表
    async fetch(type) {
        const { model, state } = this.ctx;
        const { IssueCoupon, User } = model;
        // 获取所有优惠券
        const issueCoupon = await IssueCoupon.findAll({
            where: { type }
        });
        // 找到当前用户的信息
        const user = await User.findById(state.user.sub);
        // 定义一个空数组
        const items: any = [];
        for (const iterator of issueCoupon) {
            // 查看用户是否领取过该优惠券
            const result = await iterator.hasUser(user);
            if (result) {
                iterator.draw = true;
                items.push(iterator);
            } else {
                iterator.draw = false;
                items.push(iterator);
            }
        }
        return items;
    };

    // 添加
    async add(input) {
        const { model } = this.ctx;
        const { IssueCoupon } = model;
        return await IssueCoupon.create(_.pickBy(
            _.pick(
                input,
                [
                    'amount',
                    'require',
                    'expiredDate',
                    'number',
                    'requirePoint',
                    'type',
                ]
            ),
            value => value !== null
        ));
    };

    // 更新
    async update(input) {
        const { model } = this.ctx;
        const { IssueCoupon } = model;
        const item = await IssueCoupon.findByPk(input.id);
        await item.update(_.pickBy(_.pick(
            input,
            [
                'amount',
                'require',
                'expiredDate',
                'number',
                'requirePoint',
            ]
        ),
            value => value !== null
        ));
        return item;
    };

    // 删除
    async remove(id) {
        const { model } = this.ctx;
        const { IssueCoupon } = model;
        const item = await IssueCoupon.findByPk(id);
        await item.destroy();
        return true;
    }
}

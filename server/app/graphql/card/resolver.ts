const moment = require('moment');
import { AuthenticationError } from 'apollo-server';
export const Mutation = {
    async drawCard(_root, { code }, ctx) {
        const { Card, User, Coupon } = ctx.model;
        const card = await Card.findByPk(code);
        // 定义优惠券
        const coupons = [
            { require: 20000, amount: 2000 },
            { require: 20000, amount: 2000 },
            { require: 10000, amount: 1000 },
            { require: 10000, amount: 1000 },
            { require: 1900, amount: 200 },
            { require: 1900, amount: 200 },
            { require: 1000, amount: 100 },
            { require: 1000, amount: 100 },
        ];
        // 判断优惠券是否存在
        if (!card) throw new AuthenticationError('优惠券兑换码错误.');
        // 判断优惠券是否被领取
        if (card.status === 'used') throw new AuthenticationError('优惠券已被领取.');
        // 获取当前时间
        const date = moment().format('YYYYMMDD');
        // 判断优惠券是否过期
        if (card.expiredDate <= date) throw new AuthenticationError('优惠券已过期.');
        // 找到当前用户
        const user = await User.findByPk(ctx.state.user.sub);
        const item = await Card.findOne({
            where: {
                userId: user.id,
                batch: card.batch,
            },
        });
        if (!item) {
            // 更新优惠券状态
            await card.update({
                userId: user.id,
                status: 'used',
            });
            await Coupon.bulkCreate(coupons.map(coupon => ({
                ...coupon, userId: user.id, expiredDate: moment().add(60, 'day').format('YYYYMMDD'),
            })));
            return true;
        } else {
            throw new AuthenticationError('您已领取过了优惠券.');
        }
    },

    async testCreate(_root, { status }, ctx) {
        const { Item } = ctx.model;
        const items = await Item.findAll();
        if (items) {
            for (const iterator of items) {
                await iterator.update({ status });
            }
            return true;
        }
    }
}
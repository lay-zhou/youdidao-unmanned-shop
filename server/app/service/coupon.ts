import * as moment from 'moment';
import { Service } from 'egg';

export default class CouponService extends Service {
    async fetchAll(input) {
        const { ctx } = this;
        const { User, Op, Coupon } = ctx.model;
        let pageSize = 10;
        if (input.pageSize) pageSize = Number(input.pageSize);
        const where: any = {};
        const user = await User.findByPk(ctx.state.user.sub);
        if (user.role !== 'admin') where.userId = user.id;
        switch (input.status) {
            case 'useable':
                where.usedAt = null;
                where.expiredDate = {
                    [Op.gte]: moment().format('YYYYMMDD'),
                };
                break;
            case 'used':
                where.usedAt = {
                    [Op.not]: null,
                };
                break;
            case 'expired':
                where.usedAt = null;
                where.expiredDate = {
                    [Op.lte]: moment().format('YYYYMMDD'),
                };
                break;
            default:
        }
        const options = {
            limit: pageSize,
            offset: input.currentPage ? pageSize * (input.currentPage - 1) : 0,
            order: [['id', 'DESC']],
            where,
            raw: true,
        };
        const { count: total, rows: list } = await Coupon.findAndCountAll(
            options,
        );

        for (const iterator of list) {
            iterator.expiredDate = moment(iterator.expiredDate).format('YYYY-MM-DD')
        }
        return {
            list,
            pagination: {
                total,
                pageSize,
                current: parseInt(input.currentPage, 10) || 1,
            },
        };
    }

    // 领取优惠券
    async create(id) {
        const { ctx } = this;
        const { IssueCoupon, User, Coupon, Draw } = ctx.model;
        const issueCoupon = await IssueCoupon.findByPk(id);
        const user = await User.findByPk(ctx.state.user.sub);
        // 判断当前优惠券是否存在且优惠券剩余数量不为零
        // 优惠券过期时间
        const a = moment(String(issueCoupon.expiredDate)).format('YYYYMMDD');
        // 当前时间
        const b = moment().format('YYYYMMDD');
        // 优惠券是否存在 优惠券剩余数量不为零 当前时间小于等于优惠券过期时间
        if (issueCoupon && issueCoupon.number !== 0 && a >= b) {
            // 找到当前用户领取的此型号优惠券
            const currentUserCoupon = await Coupon.findOne({
                where: {
                    issueCouponId: issueCoupon.id,
                    userId: user.id,
                },
                raw: true,
            });
            // 判断用户是否领取过优惠券
            if (!currentUserCoupon) {
                // 更新优惠券数量
                await issueCoupon.update({ number: issueCoupon.number - 1 });
                const item = await Coupon.create({
                    amount: issueCoupon.amount,
                    require: issueCoupon.require,
                    expiredDate: moment(String(issueCoupon.expiredDate)).format('YYYYMMDD'),
                    issueCouponId: issueCoupon.id,
                    userId: user.id,
                    type: issueCoupon.type,
                });
                await Draw.create({
                    userId: user.id,
                    issueCouponId: issueCoupon.id,
                });
                if (issueCoupon.number === 0) await issueCoupon.destroy();
                return item;
            } else {
                return false;
            }
        }
    }
}

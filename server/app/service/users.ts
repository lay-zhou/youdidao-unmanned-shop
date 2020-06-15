import { Service } from 'egg';
import moment = require('moment');

module.exports = class UsersService extends Service {
  ctx: any;
  app: any;
  constructor(ctx) {
    super(ctx);
  }
  // 获取用户列表
  async fetch(params) {
    const { ctx } = this;
    let pageSize = 10;
    if (params && params.pageSize) pageSize = Number(params.pageSize);
    const where: any = {};
    if (params && params.role) where.role = params.role;
    const options = {
      limit: pageSize,
      offset: params && params.currentPage ? pageSize * (params.currentPage - 1) : 0,
      order: [
        ['id', 'DESC'],
      ],
      raw: true,
      where,
    };
    const {
      count: total, rows: list,
    } = await ctx.model.User.findAndCountAll(options);
    return {
      list,
      pagination: {
        total,
        pageSize,
        current: parseInt(params && params.currentPage, 10) || 1,
      },
    };
  };

  // 登录
  async login(params) {
    const { ctx } = this;
    const { code, imageUrl, nickname } = params;
    const { openid: openId } = await ctx.service.exchange.exchangeUserInfo(code);
    if (openId) {
      const [
        wechatAccount,
        created,
      ] = await ctx.model.WechatAccount.findOrCreate({
        defaults: { openId, avatarUrl: imageUrl, nickname },
        where: { openId },
      });
      if (created) {
        const user = await ctx.model.User.create({ role: 'user' });
        await wechatAccount.update({ userId: user.id });
        const data = await ctx.service.token.generateToken(user.id);
        return data;
      } else {
        const user = await ctx.model.User.findByPk(wechatAccount.userId);
        await wechatAccount.update({ avatarUrl: imageUrl, nickname });
        const data = await ctx.service.token.generateToken(user.id);
        return data;
      }
    }
  };

  // 获取个人信息
  async info(id) {
    const { ctx } = this;
    const { User, Phone, WechatAccount, Follow } = ctx.model;
    const user = await User.findByPk(id);
    const phone = await Phone.findOne({
      where: {
        userId: user.id,
      },
      raw: true,
    });
    if (phone) {
      user.phone = phone.number;
    } else {
      user.phone = null;
    }
    const wechatAccount = await WechatAccount.findOne({
      where: {
        userId: user.id,
      },
    });
    if (wechatAccount) {
      user.imageUrl = wechatAccount.avatarUrl;
    } else {
      user.imageUrl = null;
    }
    const follow = await Follow.findAll({
      where: {
        userId: user.id,
      }
    });
    user.follow = follow.length;
    // 统计出我的粉丝
    const usersNum = await User.count({ where: { inviterId: user.id } });
    user.fans = usersNum;
    const FansList = await User.findAll({ where: { inviterId: user.id } });;
    user.fanList = FansList;
    return user;
  };

  // 控制台数据
  async fetchConsoleHome() {
    const { ctx } = this;
    const { User, Order, Op } = ctx.model;
    const user = await User.findByPk(ctx.state.user.sub);
    switch (user.role) {
      case 'admin':
        const orderSales = await Order.findAll({
          where: {
            status: {
              [Op.not]: 'unpaid',
            },
          }
        });
        const newOrderSales = await Order.findAll({
          where: {
            status: {
              [Op.not]: 'unpaid',
            },
            createdAt: {
              [Op.between]: [
                moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD h:mm:ss a'),
                moment().endOf('day').format('YYYY-MM-DD h:mm:ss a'),
              ]
            }
          }
        });
        // 总销售额
        let allSales = 0;
        for (const i of orderSales) {
          const { amount } = i;
          allSales += amount;
        }
        // 新增销售额
        let newSales = 0;
        for (const i of newOrderSales) {
          const { amount } = i;
          newSales += amount;
        }
        // 总用户
        const users = await User.count();
        // 新增用户
        const newUsers = await User.count({
          where: {
            createdAt: {
              [Op.between]: [
                moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD h:mm:ss a'),
                moment().endOf('day').format('YYYY-MM-DD h:mm:ss a'),
              ],
            },
          },
        });
        // 总订单
        const orders = await Order.count({
          where: {
            status: {
              [Op.not]: 'unpaid',
            },
          }
        });
        // 新增订单
        const newOrders = await Order.count({
          where: {
            status: {
              [Op.not]: 'unpaid',
            },
            createdAt: {
              [Op.between]: [
                moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD h:mm:ss a'),
                moment().endOf('day').format('YYYY-MM-DD h:mm:ss a'),
              ],
            },
          },
        });
        const adminData = {
          allSales,
          newSales,
          users,
          newUsers,
          orders,
          newOrders,
        };
        return adminData;

      default:
        break;
    }
  };

  // 财务统计
  async fetchAllFinancial() {
    const { ctx } = this;
    const { Order, Op } = ctx.model;
    const orderSales = await Order.findAll({
      where: {
        status: {
          [Op.not]: 'unpaid',
        },
      }
    });
    let totalSales = 0;
    for (const i of orderSales) {
      const { amount } = i;
      totalSales += amount;
    }
    const orderDaySales = await Order.findAll({
      where: {
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.between]: [
            moment().subtract(0, "day").startOf('day').format('YYYY-MM-DD') + " 00:00:00",
            moment().subtract(0, "day").endOf('day').format('YYYY-MM-DD') + " 23:59:59"
          ]
        }
      }
    });
    const orderWeekSales = await Order.findAll({
      where: {
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.between]: [
            moment().weekday(1).format('YYYY-MM-DD') + " 00:00:00",
            moment().weekday(7).format('YYYY-MM-DD') + " 23:59:59"
          ]
        }
      }
    });
    const orderMonthSales = await Order.findAll({
      where: {
        status: {
          [Op.not]: 'unpaid',
        },
        createdAt: {
          [Op.between]: [
            moment().startOf('month').format("YYYY-MM-DD") + " 00:00:00",
            moment().endOf('month').format('YYYY-MM-DD') + " 23:59:59"
          ]
        }
      }
    });

    let monthSales = 0;
    for (const i of orderMonthSales) {
      const { amount } = i;
      monthSales += amount;
    }
    let weekSales = 0;
    for (const i of orderWeekSales) {
      const { amount } = i;
      weekSales += amount;
    }
    let daySales = 0;
    for (const i of orderDaySales) {
      const { amount } = i;
      daySales += amount;
    }

    const financialData = {
      totalSales,
      monthSales,
      weekSales,
      daySales,
    };
    return financialData;
  };

  // 绑定邀请者
  /**
   * @param invitedId 邀请者的 ID
   */
  async bind(invitedId) {
    const { ctx } = this;
    const { User } = ctx.model;
    // 找到邀请者
    const inviterUser = await User.findByPk(invitedId);
    // 找到当前用户
    const currentUser = await User.findByPk(ctx.state.user.sub);
    // 用户创建时间
    const a = moment(currentUser.createdAt).format('YYYYMMDD');// 20190330
    // 当前时间+1天
    const b = moment().subtract(1, 'days').format('YYYYMMDD');
    /**
     * 判断当前用户是否为10分钟内创建
     * 判断当前用户是否已有邀请者
     * 判断邀请者是否存在
     */
    if (!currentUser.inviterId && inviterUser && a <= b && inviterUser.id !==currentUser.id) {
      await currentUser.update({ inviterId: inviterUser.id });
      return true;
    } else {
      return false;
    }
  }
}

import { UserInputError, ForbiddenError } from 'apollo-server';
import urlencode = require('urlencode');

export const Query = {
  // 用户列表
  async users(_root, { input }, ctx) {
    return await ctx.service.users.fetch(input);
  },
  // 当前用户信息
  userInfo(_root, _params, ctx) {
    return ctx.service.users.info(ctx.state.user.sub);
  },

  async consoleHome(_root, _params, { service }) {
    return await service.users.fetchConsoleHome();
  },

  async allFinancial(_root, _params, { service }) {
    return await service.users.fetchAllFinancial();
  },
};

export const Mutation = {
  // 小程序登录
  generateAccessTokenByLoginWithWeChatCode(_root,
    { code, imageUrl, nickname },
    ctx) {
    const params = { code, imageUrl, nickname };
    return ctx.service.users.login(params);
  },

  // 发送验证码
  async sendSmsCode(_root,
    { phone },
    { model }) {
    if (!phone) throw new UserInputError('请输入号码！');
    if (!(/^1[3456789]\d{9}$/.test(phone))) {
      throw new UserInputError('请输入正确的号码！');
    }
    await model.SmsCode.send(phone);
    return 'successful';
  },

  // 通过验证码登录
  async loginWithPhoneAndSmsCodeByLogin(_root,
    { phone, code },
    { model, service }) {
    const { Phone, SmsCode, User } = model;
    const userPhone = await Phone.findByPk(phone);
    if (!userPhone) throw new ForbiddenError('用户不存在！');
    if (!await SmsCode.verify(phone, code)) throw new ForbiddenError('验证码错误！');
    const user = await User.findByPk(userPhone.userId);
    const data = await service.token.generateToken(userPhone.userId);
    return {
      accessToken: data,
      role: user.role,
    };
  },

  // 邀请用户
  async invitedUsers(_root, { invitedId }, { service }) {
    return await service.users.bind(invitedId);
  },

  // 添加收藏
  async addCollection(_root, { itemCode, status }, ctx) {
    const id = ctx.state.user.sub;
    const user = await ctx.model.User.findByPk(id);
    if (!status) {
      await ctx.model.Follow.create({ userId: user.id, itemCode });
      return true;
    } else {
      const followed = await ctx.model.Follow.findOne({
        where: {
          userId: user.id,
          itemCode,
        }
      });
      await followed.destroy();
      return true;
    }
  },

  // 用户提现
  async toApplyForCashWithdrawals(_root, { input }, ctx) {
    const { User, Withdrawal, Account } = ctx.model;
    const { remark } = input;
    const user = await User.findByPk(ctx.state.user.sub);
    const { name, account, phone, card } = await Account.findOne({ where: { userId: user.id } });
    if (user.balance < 100) throw new UserInputError('余额不足！');
    const result = await Withdrawal.create({
      price: user.balance,
      name,
      phone,
      account,
      card,
      remark,
      type: 'user',
      userId: user.id,
    });
    await user.update({ balance: 0 });
    return result;
  },

  // 商户提现
  async merchantWithdrawals(_root, _params, ctx, info) {
    const { User, Store, Withdrawal, Account } = ctx.model;
    await ctx.service.user.authenticate(info);
    const currentUser = await User.findByPk(ctx.state.user.sub);
    if (currentUser.status === 'draft') throw new ForbiddenError('该账户已被冻结！');
    // 找到当前店铺
    const store = await Store.findOne({ where: { userId: currentUser.id } });
    if (store.balance < 100) throw new UserInputError('余额不足！');
    const { name, account, phone, card } = await Account.findOne({ where: { userId: currentUser.id } });
    const result = await Withdrawal.create({
      price: store.balance,
      name,
      phone,
      account,
      card,
      type: 'store',
      remark: "商户提现",
      storeId: store.id,
      userId: currentUser.id,
    });
    await store.update({ balance: 0 });
    return result;
  },

  async test(_root, _params, ctx) {
    const id = '1';
    // 获取百度的 token
    const token = await ctx.app.redis.get('baiduAccessToken');
    if (token) {
      // 定义路径
      const nsp = ctx.app.io.of('/');
      // 定义文本
      const text = `成功收款${100000 / 100}元`;
      // 定义所传数据
      const msg = {
        storeId: id,
        amount: 100,
        soundUrl: `https://tsn.baidu.com/text2audio?lan=zh&ctp=1&cuid=abcdxxx&tok=${token}&tex=${urlencode(text)}&vol=9&spd=5&pit=5`,
      };
      // 获取存储在redis中店铺的键值对
      const storeEquipment = await ctx.app.redis.get(`${id}`);
      // 传输给在线的客户端
      await nsp.to(storeEquipment).emit('online', {
        msg,
      });
    }
  },

  // 播报登录
  async tvLogin(_root, { phone, code }, { model, service }) {
    const { Phone, SmsCode, User, Store } = model;
    const userPhone = await Phone.findByPk(phone);
    if (!userPhone) throw new ForbiddenError('用户不存在！');
    if (!await SmsCode.verify(phone, code)) throw new ForbiddenError('验证码错误！');
    const store = await Store.findOne({
      where: {
        userId: userPhone.userId,
      }
    });
    if (!store) throw new ForbiddenError('该用户下的店铺不存在！');
    const user = await User.findByPk(userPhone.userId);
    const data = await service.token.generateToken(userPhone.userId);
    return {
      accessToken: data,
      role: user.role,
      me: user,
    };
  },
  // 更新用户权限
  async updateUserRole(_root, { id, role }, { model, service }, info) {
    await service.user.authenticate(info);
    const { User } = model;
    const user = await User.findByPk(id);
    if (!user) throw new ForbiddenError('用户不存在！');
    await user.update({ role });
    return true;
  }
};

export const Order = {
  async user({ userId }, _params, { model }) {
    const { User } = model;
    return await User.findByPk(userId);
  }
};

export const Balance = {
  async balanceUser({ userId }, _params, { model }) {
    const { User } = model;
    return await User.findByPk(userId);
  }
};

export const User = {
  async wechat({ id: userId }, _params, { model }) {
    const { WechatAccount } = model;
    return await WechatAccount.findOne({ where: { userId } });
  }
};
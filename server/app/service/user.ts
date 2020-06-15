import { AuthenticationError } from 'apollo-server';
import { Service } from 'egg';

const typesOperationsRolesMap = {
  /**
   * @param admin 管理员
   * @param facilitator 服务商
   * @param financial 财务
   * @param merchant 商户
   * @param keep 商户管理员
   * @param advertising 广告管理员
   * @param commodity 商品管理员
   * @param member 会员
   * @param user 普通用户
   */
  // 变更
  Mutation: {
    /*---------------------------图片相关---------------------------------- */

    // 添加banner图片
    addBanner: ['admin', 'advertising'],

    // 更新banner图片
    updateBanner: ['admin', 'advertising'],

    // 删除banner图片
    deleteBanner: ['admin', 'advertising'],

    /*-------------------------商品分类相关---------------------------------- */

    // 创建商品分类
    createClassify: ['admin', 'commodity'],

    // 更新商品分类
    updateClassify: ['admin', 'commodity'],

    // 删除商品分类
    deleteClassify: ['admin', 'commodity'],

    /*---------------------------商品相关---------------------------------- */

    // 商品创建
    createItem: ['admin', 'facilitator', 'commodity'],

    // 更新商品
    updateItem: ['admin', 'facilitator', 'commodity'],

    // 删除商品
    deleteItem: ['admin', 'facilitator', 'commodity'],

    // 更新商品专题相关
    updateItemToProject: ['admin', 'facilitator', 'commodity'],


    /*---------------------------店铺相关---------------------------------- */

    // 添加店铺
    createStore: ['admin', 'facilitator', 'keep'],

    // 更新店铺
    updateStore: ['admin', 'facilitator', 'keep'],

    // 删除店铺
    deleteStore: ['admin', 'facilitator', 'keep'],

    // 店铺上架下架
    updateStoreStatus: ['admin', 'facilitator', 'keep'],

    // 商品上架下架
    updateItemStatus: ['admin', 'facilitator', 'keep'],

    /*------------------------优惠券发放相关---------------------------------- */

    // 创建优惠券
    createIssueCoupon: ['admin', 'facilitator', 'keep'],

    // 更新优惠券
    updateIssueCoupon: ['admin', 'facilitator', 'keep'],

    // 删除优惠券
    deleteIssueCoupon: ['admin', 'facilitator', 'keep'],
    /*------------------------专题相关------------------------------------ */

    // 创建专题
    createProject: ['admin', 'facilitator', 'keep'],

    // 更新专题
    updateProject: ['admin', 'facilitator', 'keep'],

    // 删除专题
    deleteProject: ['admin', 'facilitator', 'keep'],

    /*------------------------提现相关------------------------------------ */
    // 商户提现功能
    merchantWithdrawals: ['merchant'],

    // 审核
    passAudit: ['admin'],

    // 审核功能
    audit: ['admin', 'financial'],

    /*------------------------充值相关------------------------------------ */
    // 创建充值
    createTopUp: ['admin'],

    // 更新充值
    updateTopUp: ['admin'],

    // 删除充值
    deleteTopUp: ['admin'],

    // 更新用户权限
    updateUserRole: ['admin'],
  },

  // 查询
  Query: {
    /*--------------------------店铺相关----------------------------------- */

    myStore: ['admin', 'merchant'],

    orderManage: ['admin', 'merchant'],

    appHomeData: ['merchant'],

    financial: ['merchant'],

    fetchOrderForCode: ['merchant'],

    /*--------------------------提现相关----------------------------------- */

    // 提现列表
    withdrawals: ['admin', 'facilitator', 'agent', 'merchant', 'financial'],

    /*--------------------------订单相关----------------------------------- */

    // 商户订单
    merchantOrder: ['admin', 'merchant'],

    /*--------------------------上传参数----------------------------------- */

    // 上传参数
    uploadParams: [
      'admin',
      'facilitator',
      'financial',
      'merchant',
      'keep',
      'advertising',
      'commodity',
      'member',
      'user',
    ],
  },
};

export default class UserService extends Service {
  async authenticate({ fieldName: operation, parentType: type }) {
    const { ctx } = this;
    const { User } = ctx.model;

    const operationsRolesMap = typesOperationsRolesMap[type];

    if (!operationsRolesMap) {
      throw new AuthenticationError('Not found type.');
    }

    const roles = operationsRolesMap[operation];
    
    if (!roles) {
      throw new AuthenticationError('Not found operation.');
    }

    const { user: userState } = ctx.state;

    if (!userState) throw new AuthenticationError('Must authenticate.');

    const { sub: userId } = userState;

    const user = await User.fetchByPrimaryKey(userId);

    if (!user) throw new AuthenticationError('Not found user.');

    const { role } = user;
    console.log('user',user);
    console.log('role',role);
    console.log('roles.includes(role)',roles.includes(role));

    if (!roles.includes(role)) {
      throw new AuthenticationError('Not have permission.');
    }

    ctx.state.user = { ...userState, ...user };
  }
}

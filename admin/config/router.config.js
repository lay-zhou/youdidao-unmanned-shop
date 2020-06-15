export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      { path: '/user/register', name: 'register', component: './User/Register' },
      {
        path: '/user/register-result',
        name: 'register.result',
        component: './User/RegisterResult',
      },
      {
        component: '404',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // 欢迎页面
      { path: '/', redirect: '/welcome' },
      {
        path: '/welcome',
        name: 'welcome',
        icon: 'team',
        authority: ['admin','facilitator','financial','merchant','keep','advertising','commodity','member'],
        component: './welcome',
      },
      // 数据统计
      {
        path: '/Severalseries',
        name: 'Severalseries',
        icon: 'fund',
        authority: ['admin'],
        component: './Datastatistics/Analysis',
      },
      // 财务统计
      {
        path: '/Financial',
        name: 'Financial',
        icon: 'profile',
        authority: ['admin'],
        component: './Financial/Financial',
      },
      // 商户财务统计
      {
        path: '/MyFinancial',
        name: 'MyFinancial',
        icon: 'profile',
        authority: ['merchant'],
        component: './Merchant/MyFinancial',
      },
      // 核验订单详情
      {
        path: '/MyFinancial/OrderDetails/:id',
        component: './Merchant/OrderDetails',
      },
      // 核验订单
      {
        path: '/CheckOrder',
        name: 'CheckOrder',
        icon: 'profile',
        authority: ['merchant'],
        component: './Merchant/CheckOrder',
      },
      // 核验订单详情
      {
        path: '/CheckOrder/CheckDetail/:id',
        component: './Merchant/CheckDetail',
      },
      // 绑定收款
      {
        path: '/Card',
        name: 'Card',
        icon: 'profile',
        authority: ['member','merchant'],
        component: './Merchant/Card',
      },
       // 用户充值
       {
        path: '/TopUp',
        name: 'TopUp',
        icon: 'profile',
        authority: ['admin'],
        component: './TopUp/TopUp',
      },
      // 提现管理
      {
        path: '/Withdrawals',
        name: 'Withdrawals',
        icon: 'profile',
        authority: ['admin','merchant','member'],
        routes: [
          // 申请提现
          // {
          //   path: '/Withdrawals/AddWithdrawals',
          //   name: 'AddWithdrawals',
          //   authority: ['member','admin'],
          //   component: './Withdrawals/AddWithdrawals',
          // },
          // 商户提现
          {
            path: '/Withdrawals/MerchantWithdrawals',
            name: 'MerchantWithdrawals',
            authority: ['merchant'],
            component: './Withdrawals/MerchantWithdrawals',
          },
          // 待处理提现
          {
            path: '/Withdrawals/Loading',
            name: 'Loading',
            authority: ['admin'],
            component: './Withdrawals/Loading',
          },
          // 待审核提现
          {
            path: '/Withdrawals/Audit',
            name: 'Audit',
            authority: ['admin'],
            component: './Withdrawals/Audit',
          },
          // 已拒绝提现
          {
            path: '/Withdrawals/Refuse',
            name: 'Refuse',
            authority: ['admin','merchant'],
            component: './Withdrawals/Refuse',
          },
          // 已成功提现
          {
            path: '/Withdrawals/Success',
            name: 'Success',
            authority: ['admin','merchant'],
            component: './Withdrawals/Success',
          },
        ]
      },
      // 订单管理
      {
        path: '/OrderList',
        name: 'OrderList',
        icon: 'profile',
        authority: ['admin','merchant'],
        routes: [
          // 备货订单
          {
            path: '/OrderList/PrepareGoods',
            name: 'PrepareGoods',
            component: './OrderList/PrepareGoods',
          },
          // 订单详情
          {
            path: '/OrderList/PrepareGoods/OrderDetail/:id',
            component: './OrderList/OrderDetail',
          },
          // 取货订单
          {
            path: '/OrderList/TakeGoods',
            name: 'TakeGoods',
            component: './OrderList/TakeGoods',
          },
          // 订单详情
          {
            path: '/OrderList/TakeGoods/TakeOrderDetail/:id',
            component: './OrderList/TakeOrderDetail',
          },
        ]
      },
      // 店铺列表
      {
        path: '/Store',
        name: 'Store',
        icon: 'profile',
        authority: ['admin','keep'],
        routes: [
          // 店铺列表
          {
            path: '/Store/StoreList',
            name: 'StoreList',
            component: './Store/StoreList',
          },
          // 店铺详情
          {
            path: '/Store/StoreList/StoreDetail/:id',
            component: './Store/StoreDetail',
          },
          // 未上架店铺列表
          {
            path: '/Store/GraftStore',
            name: 'GraftStore',
            component: './Store/GraftStore',
          },
          // 新建店铺
          {
            path: '/Store/GraftStore/AddStore',
            component: './Store/AddStore',
          },
          // 修改店铺
          {
            path: '/Store/GraftStore/ModifyStore/:id',
            component: './Store/ModifyStore',
          },
        ],
      },
      // 商品管理
      {
        path: '/Goods',
        name: 'Goods',
        icon: 'profile',
        authority: ['admin','commodity'],
        routes: [
          // 上架商品列表
          {
            path: '/Goods/GoodsList',
            name: 'GoodsList',
            component: './Goods/GoodsList',
          },
          // 商品详情
          {
            path: '/Goods/GoodsList/GoodDetail/:id',
            component: './Goods/GoodDetail',
          },
          // 下架商品列表
          {
            path: '/Goods/GraftGoods',
            name: 'GraftGoods',
            component: './Goods/GraftGoods',
          },
          // 新建商品
          {
            path: '/Goods/GraftGoods/AddGood',
            component: './Goods/AddGood',
          },
          // 修改商品
          {
            path: '/Goods/GraftGoods/ModifyGood/:id',
            component: './Goods/ModifyGood',
          },
          // 商品分类
          {
            path: '/Goods/GoodsClass',
            name: 'GoodsClass',
            component: './Goods/GoodsClass',
          },
        ],
      },
      // 营销设置
      {
        path: '/Coupons',
        name: 'Coupons',
        icon: 'profile',
        authority: ['admin'],
        routes: [
          // 普通优惠劵设置
          {
            path: '/Coupons/Coupons',
            name: 'Coupons',
            component: './Coupons/Coupons',
          },
          // 会员优惠劵设置
          {
            path: '/Coupons/MemberCoupons',
            name: 'MemberCoupons',
            component: './Coupons/MemberCoupons',
          },
          // 专题设置
          {
            path: '/Coupons/Project',
            name: 'Project',
            component: './Coupons/Project',
          },
          // 专题商品
          {
            path: '/Coupons/Project/ProjectItem/:id',
            component: './Coupons/ProjectItem',
          },
          // 添加专题商品
          {
            path: '/Coupons/Project/AddItem/:id',
            component: './Coupons/AddItem',
          },
        ],
      },
      // 广告管理
      {
        path: '/advertising',
        name: 'advertising',
        icon: 'profile',
        authority: ['admin','advertising'],
        routes: [
          // 首页轮播广告
          {
            path: '/advertising/advert/Shuffling',
            name: 'Shuffling',
            component: './Advert/Shuffling',
          },
          // 我的下部广告列表
          {
            path: '/advertising/advert/minebottom',
            name: 'minebottom',
            component: './Advert/minebottom',
          },
          // 电视广告
          {
            path: '/advertising/advert/Television',
            name: 'Television',
            component: './Advert/Television',
          },
        ],
      },
      //用户中心
      {
        path: '/Users',
        name: 'Users',
        icon: 'profile',
        authority: ['admin','facilitator','member'],
        routes: [
          //普通用户
          {
            path: '/Users/UserList',
            name: 'UserList',
            component: './Users/UserList',
          },
          // 普通用户订单
          {
            path: '/Users/UserList/OrderList/:id',
            component: './Users/OrderList',
          },
          // 普通用户订单详情
          {
            path: '/Users/UserList/OrderList/OrderDetail/:id',
            component: './Users/OrderDetail',
          },
          //会员用户
          {
            path: '/Users/MemberList',
            name: 'MemberList',
            component: './Users/MemberList',
          },
          // 会员用户订单
          {
            path: '/Users/MemberList/OrderList/:id',
            component: './Users/OrderList',
          },
          // 会员用户订单详情
          {
            path: '/Users/MemberList/OrderList/OrderDetail/:id',
            component: './Users/OrderDetail',
          },
          //分销用户
          {
            path: '/Users/DistributionList',
            name: 'DistributionList',
            component: './Users/DistributionList',
          },
          // 分销用户订单
          {
            path: '/Users/DistributionList/OrderList/:id',
            component: './Users/OrderList',
          },
           // 会员用户订单详情
           {
            path: '/Users/DistributionList/OrderList/OrderDetail/:id',
            component: './Users/OrderDetail',
          },
        ],
      },
      // 设置
      {
        path: '/setting',
        name: 'setting',
        icon: 'user',
        authority: ['admin'],
        routes: [
          {
            path: '/setting/about',
            name: 'about',
            component: './Setting/about',
          },
          {
            path: '/setting/Confusion',
            name: 'Confusion',
            component: './Setting/Confusion',
          },
          {
            path: '/setting/Agreement',
            name: 'Agreement',
            component: './Setting/Agreement',
          },
          // {
          //   path: '/setting/AppId',
          //   name: 'AppId',
          //   component: './Setting/AppId',
          // },
          // {
          //   path: '/setting/AppSecret',
          //   name: 'AppSecret',
          //   component: './Setting/AppSecret',
          // },
        ]
      },
      {
        component: '404',
      },
    ],
  },
];

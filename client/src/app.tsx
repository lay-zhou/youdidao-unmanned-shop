import Taro, { Component, Config } from "@tarojs/taro";
import { Provider }./pages/index/indexs/redux";
import "@tarojs/async-await";
import 'taro-ui/dist/style/index.scss'
import "./app.less";
import models from './models';
import dva from './utils/dva';


// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

// const dvaApp = dva.createApp({
//   initialState: {},
//   models: models,
// });

// const store = dvaApp.getStore();
const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});
const store = dvaApp.getStore();
class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      // 主页
      "pages/home/index",
      // 品类
      "pages/classification/index",
      // 购物车
      "pages/shoppingCart/index",
      // 我的
      "pages/mine/index",
      // 取货码certificates
      "pages/certificates/index",
      // 附近商家
      "pages/nearbystores/index",
      //商品详情details
      "pages/details/index",
      //邀请gifts
      "pages/gifts/index",
      //我的订单theorder
      "pages/theorder/index",
      //我的奖励reward
      "pages/reward/index",
      //支付结果results
      "pages/results/index",
      //订单详情orderDetails
      "pages/orderDetails/index",
      "pages/theMemberCenter/index",
      //跳转商品分类
      "pages/itemLists/index",
      "pages/searchPage/index",
      //用户协议
      "pages/agreement/index",
      //绑定手机号
      "pages/bindPhoneNum/index",
      //确认订单
      "pages/orderInformation/index",
      //收藏
      "pages/collection/index",
      //专题
      "pages/project/index",
      //余额提现
      "pages/withdrawal/index",
      //粉丝订单
      "pages/fans/index",
      //我的粉丝
      "pages/myFans/index",
      //账户明细
      "pages/account/index",
      //绑定
      "pages/addCollection/index",

    ],
    subPackages: [
      {
        "root": "packageA",
        "pages": [
          //提现成功
          "pages/withdrawalSuccess/index",
          //经营许可证
          "pages/business/index",
          // 我的积分
          "pages/integral/index",
          // 我的优惠券
          "pages/myCoupons/index",
          // 我的会员开卡
          "pages/topup/index",
          // 我的余额
          "pages/balance/index",
          // 充值
          "pages/prepaid/index",
          // 活动优惠券
          "pages/activityCoupons/index",
        ]
      }
    ],
    permission: {
      "scope.userLocation": {
        desc: "您的位置信息将用于小程序位置效果展示"
      }
    },
    window: {
      backgroundTextStyle: "light",
      navigationBarBackgroundColor: "#fff",
      navigationBarTitleText: "WeChat",
      navigationBarTextStyle: "black",
      enablePullDownRefresh: true,
    },
    navigateToMiniProgramAppIdList: [
      "wx4a96aca05249ba58",
    ],

    tabBar: {
      color: "#000000",
      selectedColor: "#04304b",
      backgroundColor: "#fff",
      list: [
        {
          text: "首页",
          pagePath: "pages/home/index",
          iconPath: "./img/homePage1.png",
          selectedIconPath: "./img/homePage.png",
        },
        {
          text: "品类",
          pagePath: "pages/classification/index",
          iconPath: "./img/pickupCode1.png",
          selectedIconPath: "./img/category.png"
        },
        {
          text: "购物车",
          pagePath: "pages/shoppingCart/index",
          iconPath: "./img/shopping1.png",
          selectedIconPath: "./img/shopping.png"
        },
        {
          text: "取货码",
          pagePath: "pages/certificates/index",
          iconPath: "./img/category1.png",
          selectedIconPath: "./img/pickupCode.png"
        },
        {
          text: "我的",
          pagePath: "pages/mine/index",
          iconPath: "./img/my1.png",
          selectedIconPath: "./img/my.png"
        }
      ]
    }
  };

  /**
   *
   *  1.小程序打开的参数 globalData.extraData.xx
   *  2.从二维码进入的参数 globalData.extraData.xx
   *  3.获取小程序的设备信息 globalData.systemInfo
   * @memberof App
   */
  componentDidMount() {
    if (Taro.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        console.log("onCheckForUpdate====", res);
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log("res.hasUpdate====");
          updateManager.onUpdateReady(function() {
            Taro.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function(res) {
                console.log("success====", res);
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            Taro.showModal({
              title: "已经有新版本了哟~",
              content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~"
            });
          });
        }
      });
    }
  }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById("app"));

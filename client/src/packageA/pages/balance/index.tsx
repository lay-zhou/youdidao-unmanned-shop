import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button, Text } from "@tarojs/components";
import "./index.less";
import { balance } from "./service";
import { userInfo } from "../../../pages/orderDetails/service";
import moment from "moment";
moment.locale("zh-cn");


interface IState {
  current: number;
  myIntegral?: any;
  list?: any;
  currentPage: number;
}
export default class Home extends Component<null, IState> {
  config: Config = {
    navigationBarTitleText: "我的余额",
  };

  state = {
    current: 0,
    list: [],
    myIntegral: null,
    currentPage: 1,
  };

  async componentWillMount() {
    const { currentPage } = this.state;
    const balanceResult = await balance(currentPage);
    const listDetail = balanceResult.data.balance.list;
    this.setState({
      list: listDetail
    });
    const token = Taro.getStorageSync('accessToken');
    if (token) {
      const { data } = await userInfo();
      this.setState({
        myIntegral: data.userInfo
      });
    }
  }
  async onPullDownRefresh() {
    const balanceResult = await balance(1);
    const listDetail = balanceResult.data.balance.list;
    this.setState({
      list: listDetail,
      currentPage: 1
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }

  async onReachBottom() {
    const { currentPage, list } = this.state;
    const currentPageAdd = currentPage + 1;
    const balanceResult = await balance(currentPageAdd);
    const { list: newList } = balanceResult.data.items;
    if (newList.length !== 0) {
      //上拉加载
      Taro.showLoading({
        title: '正在加载',
      })
      this.setState({
        currentPage: currentPageAdd
      })
      if (newList) {
        for (const iterator of newList) {
          list.push(iterator);
        }
        this.setState({
          list
        });
      }
      setTimeout(function () {
        Taro.hideLoading()
      }, 1000)
    } else {
      setTimeout(function () {
        Taro.showToast({
          title: '已全部加载',
          icon: 'error',
          mask: true,
        })
      }, 10)
    }
  }

  prepaidJump() {
    const { id } = this.$router.params;
    Taro.navigateTo({
      url: `../prepaid/index?id=${id}`
    });
  }

  render() {
    const { list, myIntegral } = this.state;
    return (
      <View className="index">
        <View className="banner">
        </View>
        <View className="myIntegral">
          <View className="integralCon">
            <View className="integralTxt">
              <Text>当前余额</Text>
              <Text className="integralContent">充值说明</Text>
            </View>
            <View className="integralTxt">
              <Text className="integralTitle">{myIntegral.balance / 100}</Text>元
              <Button
                className="integralExchange"
                onClick={this.prepaidJump}
              >充值</Button>
            </View>
          </View>
        </View>

        <View className="myIntegralBox">
          <View className="IntegralBoxTitle">
            <Text>余额明细</Text>
            <Text className="IntegralBoxTxt">最近30条余额消费明细</Text>
          </View>
          <View>
            {list.map(item => (
              <View className="IntegralBoxCon">
                <View className="IntegralBoxTime">
                  <Text>{item.remark}</Text>
                  <Text className="IntegralBoxTimeNum">{moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Text>
                </View>
                <View className="IntegralBox_view">
                  <Text className="IntegralBoxNum">{item.add ? '+' : '-'}</Text>
                  <Text className="IntegralBoxNum">{item.price / 100}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </View>
    );
  }
}

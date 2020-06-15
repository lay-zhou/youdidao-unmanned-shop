import Taro, { Component, Config } from "@tarojs/taro";
import { AtTabs, AtTabsPane } from 'taro-ui'
import { ScrollView, View, Text, Button } from "@tarojs/components";
import "./index.less";
import { withdrawals } from "./service";
import { userInfo } from "../orderDetails/service";

interface IState {
  current: number;
  query: {
    data: {
      userInfo?: any
    };
  };
  withdrawalsQuery: {
    data?: any;
  }
}
export default class certificates extends Component<any, IState>  {
  config: Config = {
    navigationBarTitleText: "账户明细",
    enablePullDownRefresh: true
  };
  state = {
    current: 0,
    query: {
      loading: true,
      data: {
        userInfo: {
          balance: 1,
        }
      }
    },
    withdrawalsQuery: {
      data: {
        withdrawals: {
          list: []
        }
      }
    }
  };
  handleClick(value) {

    this.setState({
      current: value
    })
  }

  forward() {
    Taro.navigateTo({
      url: "../withdrawal/index"
    });
  }

  async componentWillMount() {
    const userResult = await userInfo();
    this.setState({
      query: userResult
    });
    const withdrawalsResult = await withdrawals(1);
    this.setState({
      withdrawalsQuery: withdrawalsResult
    });
  }
  //下拉刷新
  async onPullDownRefresh() {
    const userResult = await userInfo();
    this.setState({
      query: userResult
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }

  render() {
    const { query, withdrawalsQuery } = this.state;
    const withdrawalsList = withdrawalsQuery.data.withdrawals.list;
    return (
      <ScrollView>
        <AtTabs
          animated={false}
          current={this.state.current}
          tabList={[
            { title: '余额明细' },
            { title: '提现记录' },
          ]}
          onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={this.state.current} index={0} >
            <View className="ortherInformationBox">
              <View className="otherInformation">
                <Text className="orderName1">可用余额(元)</Text>
                <Text className="orderName">{query.data.userInfo.balance / 100}</Text>
              </View>
            </View>
            <Button className="button" onClick={this.forward}>
              前往提现
            </Button>
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} >
                {withdrawalsList.map(orderItms => (
                <View className="yuy">
                  提现记录:
                  <View className="yhui">
                    <Text className="coupons_text">收款人:</Text>
                    <View className="choose_coupons">
                      <Text className='goodName1'>
                        {orderItms.name}
                      </Text>
                    </View>
                  </View>
                  <View className="yhui">
                    <Text className="coupons_text">提现卡号:</Text>
                    <View className="choose_coupons">
                      <Text className='goodName1'>
                      {orderItms.card}
                      </Text>
                    </View>
                  </View>
                  <View className="yhui">
                    <Text className="coupons_text">提现时间:</Text>
                    <View className="choose_coupons">
                      <Text className='goodName1'>
                      {orderItms.createdAt}
                      </Text>
                    </View>
                  </View>
                  <View className="yhui">
                    <Text className="coupons_text">提现金额:</Text>
                    <View className="choose_coupons">
                      <Text className='goodName1'>
                      ￥{orderItms.price / 100}
                      </Text>
                    </View>
                  </View>
                </View>
                 ))}
          </AtTabsPane>
        </AtTabs>
      </ScrollView>
    );
  }
}

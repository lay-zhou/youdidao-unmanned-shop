import Taro, { Component, Config } from "@tarojs/taro";
import { AtTabs, AtTabsPane } from 'taro-ui'
import { ScrollView, View, Text, Image } from "@tarojs/components";
import "./index.less";
import { balance } from "./service";

interface IState {
  current: number;
  current1: number;
  balanceQuery: {
    data: any;
  };
  list?: any;
}
export default class certificates extends Component<any, IState>  {
  config: Config = {
    navigationBarTitleText: "粉丝订单"
  };
  state = {
    current: 0,
    current1: 0,
    balanceQuery: {
      data: null
    },
    list: []
  };
  handleClick(value) {

    this.setState({
      current: value
    })
  }
  handle(value1) {

    this.setState({
      current1: value1
    })
  }

  async componentWillMount() {
    const goods = await balance();
    const loadList = goods.data.balance.list;
    this.setState({
      balanceQuery: goods,
      list:loadList
    });
   }

  render() {
    const { list } = this.state;
    
    const labe = [
      {
        id: 1,
        names: 0,
        name: "付款笔数"
      },
      {
        id: 2,
        names: 0.0,
        name: "成交金额"
      },
      {
        id: 2,
        names: 0.0,
        name: "预计收入"
      },

    ];
    return (
      <ScrollView className="index">
        <AtTabs
          animated={false}
          current={this.state.current}
          tabList={[
            { title: '本月订单' },
            { title: '上月订单' },
          ]}
          onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={this.state.current} index={0} >
            <View className="ortherInformationBox">
              {labe.map(order => (
                <View
                  className="otherInformation"
                  key={order.id}
                >
                  <Text className="orderName1">{order.name}</Text>
                  <Text className="orderName">{order.names}</Text>
                </View>
              ))}
            </View>
            <AtTabs
              animated={false}
              current={this.state.current1}
              tabList={[
                { title: '全部' },
                { title: '已付款' },
                { title: '已结算' },
                { title: '已失效' },
              ]}
              onClick={this.handle.bind(this)}>
              <AtTabsPane current={this.state.current1} index={0} >
                {list.map(order => (
                <View
                  key={order.id}
                  className="one_order"
                >
                  <View className="one_order_top_right">
                    <Text className="order_status">{order.id}1</Text>
                    <Text className="order_status">{order.balance}2</Text>
                    <Text className="order_status">{order.price}3</Text>
                    <Text className="order_status">{order.add}4</Text>
                    <Text className="order_status">{order.remark}5</Text>
                  </View>

                  <View className="imgs_box">
                    {order.balanceOrder.orderItem.map(orderItms => (
                      <View>
                        <Text className="order_status">
                          {orderItms.title}1
                        </Text>
                        <View key={order.balanceOrder.id} className="oneItemImage">
                          <Image src={orderItms.imageUrl} className="img" />
                          <Text className="oneItemNumber">
                            ×{orderItms.number}1
                          </Text>
                        </View>
                      </View>
                    ))}
                    {order.balanceStoreInfo.map(orderItms => (
                      <View>
                        <Text className="order_status">
                          {orderItms.name}1
                        </Text>
                        <View key={orderItms.id} className="oneItemImage">
                          1<Image src={orderItms.imageUrl} className="img" />
                        </View>
                      </View>
                    ))}
                    {order.balanceUser.map(orderItms => (
                      <View>
                        <View key={orderItms.id} className="oneItemImage">1
                        </View>
                      </View>
                    ))}
                  </View>
                  <View className="one_order_bottom">
                    <Text className="one_order_bottom_priceTotal">
                     ￥{(order.balanceOrder.amount / 100).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
              </AtTabsPane>
              <AtTabsPane current={this.state.current1} index={1} ></AtTabsPane>
              <AtTabsPane current={this.state.current1} index={2} ></AtTabsPane>
              <AtTabsPane current={this.state.current1} index={3} ></AtTabsPane>
            </AtTabs>
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} ></AtTabsPane>
        </AtTabs>
      </ScrollView>
    );
  }
}

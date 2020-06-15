import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, OpenData, Swiper, SwiperItem, Image, Button } from "@tarojs/components";
import "./index.less";
import { orders } from "./service";

interface IState {
  id: {
    data: any;
  };
  query: {
    data?: any;
  };
  list?: any;
}
export default class certificates extends Component<any, IState>{
  config: Config = {
    navigationBarTitleText: "取货码",
    enablePullDownRefresh: true
  };
  state = {
    id: {
      data: null,
      loading: true,
    },
    query: {
      loading: true,
      data: null
    },
    list: []
  }

  async componentDidShow() {
    const paymentId = Taro.getStorageSync("paymentId");
    this.setState({
      id: paymentId
    });
  }

  async componentWillMount() {
    const paymentId = Taro.getStorageSync("paymentId");
    this.setState({
      id: paymentId
    });
    let status;
    status = "fetch";
    let type;
    type = "unmanned";
    const result = await orders(status, 1, type);
    console.log('取货码result',result);
    
    const list = result.data.orders.list;
    
    this.setState({
      query: result,
      list: list
    });
  }
  //下拉刷新
  async onPullDownRefresh() {
    const paymentId = Taro.getStorageSync("paymentId");
    this.setState({
      id: paymentId
    });
    let status;
    status = "fetch";
    let type;
    type = "unmanned";
    const result = await orders(status, 1, type);
    const list = result.data.orders.list;
    this.setState({
      query: result,
      list: list
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }

  goToHome() {
    Taro.switchTab({
      url: "../home/index"
    });
  }
  render() {
    const { list } = this.state;
    return (
      <View>
        {list.length > 0 ? (
          <View className="index">
            <View className="head">
              <OpenData type="userAvatarUrl" />
            </View>
            <Swiper
              indicatorColor="#333"
              indicatorActiveColor="#00bc71"
              circular
              indicatorDots
              className="topBanner-box"
            >
              {list.map(order => (
                <SwiperItem>
                  <View className="pickUp">
                    <View>
                      <Text className="storeName">请您前往</Text>
                      <Text className="realStoreName">
                        【{order.store.name}】
                      </Text>
                      <Text className="storeName">取货</Text>
                    </View>
                    <View>
                      <View className="ercode">
                        <Image src={order.qrCode} className="ercode1" />
                      </View>
                      <View className='orther1'>
                        订单编号:<Text className='orther'>{order.id} \n</Text>
                      </View>
                      <View className='orther1'>
                        取货日期:<Text className='orther'> {order.time}</Text>
                      </View>
                      {/* <View className='orther1'>
                        取货时间:<Text className='orther'> {order.time}</Text> */}
                      {/* </View> */}
                    </View>
                  </View>
                </SwiperItem>
              ))}

            </Swiper>

          </View>
        ) : (
          <View>
            {/* 分割线 */}
            <View className="coarseLine" />
            <View className='nullBox'>
              <Image 
                src='https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/takenGoods.png' 
                className='empty' 
              />
              <Text className='orderNullText'>门店自提订单购买完成后将生成取货二维码</Text>
              <Text className='orderNullText'>凭此二维码前往指定地点取货</Text>
              <Button className='goToHome' onClick={this.goToHome}>去逛逛</Button>
            </View>
          </View>
          )}
      </View>
    );
  }
}

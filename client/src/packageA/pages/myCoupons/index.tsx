import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import "./index.less";
import { myCoupons } from "./service";

var moment = require("moment");
moment.locale("zh-cn");

interface IState {
  current: number;
  pageSize: number;
  currentPage: number;
  couponsList?: any;
  pagination: any;
  status: string;
}
export default class receiveCoupons extends Component<any, IState> {
  config = {
    navigationBarTitleText: "我的优惠券",
  };
  state = {
    current: 0,
    pageSize: 10,
    currentPage: 1,
    couponsList: [],
    pagination: {},
    status: 'useable',
  };

  //tab跳转
  async handleClick(value) {
    const { pageSize, currentPage } = this.state;
    let statusNow;
    switch (value) {
      case 0:
        statusNow = "useable";
        break;
      case 1:
        statusNow = "used";
        break;
      case 2:
        statusNow = "expired";
        break;
      default:
        break;
    }
    this.setState({
      current: value,
      status: statusNow
    })
    const { data } = await myCoupons(statusNow, pageSize, currentPage );
    const { list, pagination } = data.coupons;
    
    this.setState({
      couponsList: list,
      pagination,
    });
  }

  async componentWillMount() {
    const { status, pageSize, currentPage } = this.state;
    const { data } = await myCoupons(status, pageSize, currentPage );
    const { list, pagination } = data.coupons;
    
    this.setState({
      couponsList: list,
      pagination,
    });
  }

  //下拉刷新
  async onPullDownRefresh() {
    const { status, pageSize } = this.state;
    const { data } = await myCoupons(status, pageSize, 1);
    const { list, pagination } = data.coupons;
    this.setState({
      couponsList: list,
      pagination,
      currentPage: 1,
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }

  // 上拉加载
  async onReachBottom() {
    const { status, pageSize, currentPage, couponsList } = this.state;
    const currentPageAdd = currentPage + 1;
    const { data } = await myCoupons(status, pageSize, currentPageAdd );
    const { list } = data.coupons;
    if (list.length !== 0) {
      //上拉加载
      Taro.showLoading({
        title: '正在加载',
      })
      this.setState({
        currentPage: currentPageAdd
      })
      if (list) {
        for (const iterator of list) {
          couponsList.push(iterator);
        }
        this.setState({
          couponsList
        });
      }
      setTimeout(function () {
        Taro.hideLoading()
      }, 1000)
    }else {
      setTimeout(function(){
        Taro.showToast({
          title: '已全部加载',
          icon: 'error',
          mask: true,
        })
      }, 10)
    }
  }

  render() {
    const { couponsList, pagination } = this.state;
    console.log('couponsList',couponsList);
    

    const tabList = [
      { title: "未使用", id: 0 },
      { title: "已使用", id: 1 },
      { title: "已过期", id: 2 },
    ];

    return (
      <View>
        <AtTabs
          current={this.state.current}
          tabList={tabList}
          onClick={this.handleClick.bind(this)}
        >
          {tabList.map(item => (
            <AtTabsPane
              current={this.state.current}
              index={item.id}
              key={item.id}
            >
              {pagination.total !==0 ? (
                <View>
                {couponsList.map(myCoupon => (
                  <View key={myCoupon.id} className="oneCoupons">
                    {
                      moment(moment(new Date()).format('YYYY-MM-DD')).diff(moment(myCoupon.expiredDate).format('YYYY-MM-DD'), 'day')>=0?
                        <View className='alreadyOverdue'>
                          <Image src='https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/alreadyUse.png' />
                        </View>
                      :null
                    }
                    <View className="oneCoupons-left">
                      <Text className="price">￥{myCoupon.amount / 100}</Text>
                    </View>
                    <View className="oneCoupons-right">
                      <View className="oneCoupons-right-top">
                        <View className='oneCoupons-require'>
                          <Text className="fullPrice">
                            满{myCoupon.require / 100}减{myCoupon.amount / 100}
                          </Text>
                        </View>
                        <Text className="type">
                          过期时间:{myCoupon.expiredDate}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              ):(
                <View className="nullBox">
                  <Image src='https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/takenGoods.png' className="empty" />
                  <Text className="orederNullText">暂无可用优惠券！</Text>
                </View>
              )}
            </AtTabsPane>
          ))}
        </AtTabs>
      </View>
    );
  }
}


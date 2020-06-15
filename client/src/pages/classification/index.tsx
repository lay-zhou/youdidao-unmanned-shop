import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, Input, } from "@tarojs/components";
import { classify, items } from "./service";
import { AtTabs, AtTabsPane, AtIcon } from "taro-ui";
import { connect } from '@tarojs/redux';
import "./index.less";

interface IState {
  current: number;
  authorization: boolean;
  query: {
    data?: any;
  };
  list?: any;
  input: string;
  currentPage: number;
  pageSize: number;
  tableId: number;
}
@connect(({ common }) => ({ common }))
export default class Classification extends Component<any, IState>{
  config: Config = {
    navigationBarTitleText: "品类",
  };
  state = {
    current: 0,
    authorization: false,
    query: {
      data: {
        classify: [],
      },
      loading: false
    },
    list: [],
    input: "",
    currentPage: 1,
    pageSize: 10,
    tableId: 1,
  };

  // tab切换
  async handleClick(value) {
    const { currentPage, pageSize } = this.state;
    this.setState({
      current: value
    });
    const { query } = this.state;
    const tabList = query.data.classify;
    const id = tabList[value].id;
    this.setState({
      tableId: id
    })
    const resultItems = await items(id,currentPage,pageSize);
    const list = resultItems.data.items.list;
    this.setState({
      list: list
    });
  }

  // 加入购物车
  onOpenDoor(item) {
    const data: any = {};
    data.itemId = item.code;
    data.name = item.name;
    data.number = 1;
    data.price = item.price;
    data.unit = item.unit;
    data.content = item.content;
    data.imageUrl = item.imageUrl;
    data.originalPrice = item.originalPrice;
    data.memberPrice = item.memberPrice;
    const { dispatch } = this.props;
    dispatch({
      type: 'common/addToCartByCode',
      payload: data
    });
  }

  // 跳转商品详情
  handleDetails(code) {
    Taro.navigateTo({
      url: `../details/index?code=${code}`
    });
  }

  // 页面加载前
  async componentWillMount() {
    const { currentPage, pageSize } = this.state;
    const result = await classify();
    this.setState({
      query: result
    });
    const id = result.data.classify[0].id;
    const resultItems = await items(id,currentPage,pageSize);
    const list = resultItems.data.items.list;
    this.setState({
      list: list
    });
  }

  // 下拉刷新
  async onPullDownRefresh() {
    const { pageSize, tableId } = this.state;
    const resultItems = await items(tableId, 1,pageSize);
    const list = resultItems.data.items.list;
    this.setState({
      list: list,
      currentPage: 1
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }

  // 上拉加载
  async onReachBottom() {
    const { currentPage, pageSize ,list, tableId } = this.state;
    const currentPageAdd = currentPage + 1;
    const resultItems = await items(tableId, currentPageAdd, pageSize);
    const { list: newList } = resultItems.data.items;
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

  // 搜索按钮
  clickSearch() {
    const { input } = this.state;
    Taro.navigateTo({
      url: `../searchPage/index?nameLike=${input}`
    });
  }

  // 搜索框内容修改
  handleOnChange(e) {
    this.setState({
      input: e.detail.value
    });
  }

  render() {
    const { query, list } = this.state;
    const tabList = query.data.classify;
    const { cartItems } = this.props.common;
     // 购物车右上角图标
    if (cartItems.length === 0) {
      Taro.removeTabBarBadge({
        index: 2
      })
    }else{
      let sum = 0;
      let i;
      for( i in cartItems){
        if(cartItems[i].checked){
          sum += parseInt(cartItems[i].number);
        }
      }
      Taro.setTabBarBadge({
        index: 2,
        text: "" + sum + ""	,
      })
    }

    return (
      <View className="index">
        {/* 搜索框 */}
        <View className="rightSearchBox">
          <Image 
            src='https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/searchimg.png' 
            className="searchImg" 
          />
          <Input
            type="text"
            placeholder="搜索你想要的商品"
            className="input"
            value={this.state.input}
            onInput={this.handleOnChange}
            onConfirm={this.clickSearch}
          />
        </View>
        <AtTabs
          current={this.state.current}
          className="attab"
          height="95vh;"
          tabDirection="vertical"
          tabList={tabList}
          onClick={this.handleClick.bind(this)}
        >
          {tabList.map((currentValue, index) => (
            <AtTabsPane
              tabDirection="vertical"
              current={this.state.current}
              index={index}
              key={currentValue.id}
            >
              {list.map(item => (
                <View key={item.code} className="goodBox">
                  <Image src={item.imageUrl} className="img" onClick={this.handleDetails.bind(this, item.code)}/>
                  <View className='rightBox'>
                    <View className='topText' onClick={this.handleDetails.bind(this, item.code)}>
                      <Text className='goodName'>{item.name}</Text>
                    </View>
                    <Text className="goodName">{item.number}</Text>
                    <View className="item_right_box">
                      <View className="priceBox">
                        <Text className="price" onClick={this.handleDetails.bind(this, item.code)}>
                          ￥{(item.price / 100).toFixed(2)}/{item.unit}
                        </Text>
                        <Text className="originalPrice">
                          ￥{(item.originalPrice / 100).toFixed(2)}
                        </Text>
                      </View>
                      <View className="shoppingCart" onClick={this.onOpenDoor.bind(this,item)}>
                        <AtIcon value='shopping-cart' size='20' color='#fff'></AtIcon>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </AtTabsPane>
          ))}
        </AtTabs>
      </View>
    );
  }
};

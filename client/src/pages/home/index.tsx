import Taro, { Config } from "@tarojs/taro";
import {
  View,
  Text,
  Image,
  Input,
  Swiper,
  SwiperItem,
} from "@tarojs/components";
import {
  banners,
  classify,
  homeCenterQuery,
  items,
  homeCenter,
  invitedUsers,
  projectItems,
  singleItem
} from "./service";
import { AtIcon } from "taro-ui";
import { userInfo } from "../orderDetails/service";
import shoppingScan from '../../img/shoppingScan.png'
import { connect } from '@tarojs/redux';
import "./index.less";
import scan from "../../img/scan.png";
import diamond from "../../img/diamond.png";

// 引入moment
import moment from "moment";
moment.locale("zh-cn");

interface IState {
  tabbarFix: boolean;
  fixTop: number,
  authorization: boolean;
  query: {
    data: any;
  };
  myUserDetail: {
    data: any;
  };
  myLatitude: number;
  myLongitude: number;
  sotreQuery: {
    data: any;
  };
  addressQuery: {
    data: any;
  };
  centerQuery: {
    data: any;
  };
  bottomQuery: {
    data: any;
  };
  classifyQuery: {
    data: any;
  };
  itemsQuery: {
    data: any;
  };
  StoreName: {
    data: any;
  };
  projectItems1: {
    data: any;
  }
  projectItems2: {
    data: any;
  }
  projectItems3: {
    data: any;
  }
  input: string;
  list?: any;
  statusBar: number;
  ToUpper: boolean;
}
@connect(({ common }) => ({ common }))
export default class Home extends Taro.Component<any, IState> {
  config: Config = {
    navigationBarTitleText: "有地道",
    // 状态栏自定义
    navigationStyle: "custom",
    // 状态栏颜色白色
    navigationBarTextStyle: "white",
  };

  state = {
    statusBar: 0,
    fixTop: 0,
    tabbarFix: false,
    authorization: false,
    query: {
      data: null,
      loading: true,
    },
    myUserDetail: {
      data: null,
      loading: true,
    },
    StoreName: {
      data: null,
      loading: true,
    },
    sotreQuery: {
      data: null,
      loading: true
    },
    addressQuery: {
      data: null
    },
    centerQuery: {
      data: null
    },
    bottomQuery: {
      data: null
    },
    classifyQuery: {
      data: null
    },
    itemsQuery: {
      data: null
    },
    projectItems1: {
      data: null
    },
    projectItems2: {
      data: null
    },
    projectItems3: {
      data: null
    },
    myLatitude: 1,
    myLongitude: 1,
    input: "",
    ToUpper: false
  };

  // 页面加载前
  async componentWillMount() {
    Taro.showShareMenu({
      withShareTicket: true
    });
    if (!Taro.getStorageSync("storeId")) {
      Taro.navigateTo({
        url: "../nearbystores/index"
      });
    }

    const projectItems1 = await projectItems(1, 1)
    const { imageUrl } = projectItems1.data.items.list[0];
    this.setState({
      projectItems1: imageUrl
    });
    const projectItems2 = await projectItems(2, 2)
    const { list: projectItems2List } = projectItems2.data.items;
    this.setState({
      projectItems2: projectItems2List
    });
    const projectItems3 = await projectItems(3, 2)
    const { list: projectItems3List } = projectItems3.data.items;
    this.setState({
      projectItems3: projectItems3List
    });
    const userDetail = await userInfo();
    this.setState({
      myUserDetail: userDetail.data.userInfo
    });
  }
  async componentDidShow() {
    //会获取组件到最上面的距离(就是我菜单的class)
    if (this.state.fixTop === 0) {
      wx.createSelectorQuery().select('#topTabBar').boundingClientRect(res => {
        console.log('componentDidMount res', res);
        if (res && res.top) {
          this.setState({
            fixTop: res.top,
          })
        }
      }).exec();
    }
    //店铺名称
    const nearbyStoreName = Taro.getStorageSync("nearbyStoreName");
    this.setState({
      StoreName: nearbyStoreName
    });

  }

  //下拉刷新
  async onPullDownRefresh() {
    // 获取top Banner
    const result = await banners("top");
    this.setState({
      query: result
    });
    const centerImge = await homeCenterQuery("center");
    this.setState({
      centerQuery: centerImge
    });
    const bottomResult = await homeCenter("bottom");
    this.setState({
      bottomQuery: bottomResult
    });

    // 商品分类
    const classResult = await classify();
    this.setState({
      classifyQuery: classResult
    });

    // 商品
    const goods = await items(18, 1);
    this.setState({
      itemsQuery: goods
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
      this.setState({
        ToUpper: false
      })
    }, 1500);
  }

  // 搜索按钮
  clickSearch() {
    const { input } = this.state;
    Taro.navigateTo({
      url: `../searchPage/index?nameLike=${input}`
    });
  }

  // 跳转取货码
  itemDetails() {
    Taro.switchTab({
      url: "../certificates/index"
    });
  }
  // 跳转附件商家列表
  nearbystores() {
    Taro.navigateTo({
      url: "../nearbystores/index"
    });
  }
  async lookForward() {
    const { dispatch } = this.props;
    const { result } = await Taro.scanCode();
    console.log('扫码result', result);

    const obj = JSON.parse(result);
    if (obj.userId) {
      console.log('扫码邀请');
      const { data } = await invitedUsers(obj.userId);
      console.log('lookForward data',data);
      
      if (data) {
        Taro.showToast({
          title: "绑定成功",
          icon: "success"
        })
      }
    } else {
      console.log('扫码加购');
      const itemResult = await singleItem(result);
      console.log('扫码加入购物车itemResult', itemResult);
      const data: any = {};
      data.itemId = itemResult.data.item.code;
      data.name = itemResult.data.item.name;
      data.number = 1;
      data.price = itemResult.data.item.price;
      data.unit = itemResult.data.item.unit;
      data.imageUrl = itemResult.data.item.imageUrl;
      data.pointDiscountPrice = itemResult.data.item.pointDiscountPrice;
      data.originalPrice = itemResult.data.item.originalPrice;
      data.memberPrice = itemResult.data.item.memberPrice;
      await dispatch({
        type: 'common/addToCartByCode',
        payload: data
      });
    }

  }
  // 专题
  handleProject(id) {
    Taro.navigateTo({
      url: `../project/index?id=${id}`
    });
  }

  onOpenDoor(code, name, number, price, unit, imageUrl, pointDiscountPrice, originalPrice, memberPrice) {
    const data: any = {};
    data.itemId = code;
    data.name = name;
    data.number = number;
    data.price = price;
    data.unit = unit;
    data.imageUrl = imageUrl;
    data.pointDiscountPrice = pointDiscountPrice;
    data.originalPrice = originalPrice;
    data.memberPrice = memberPrice;
    console.log('data', data);

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
  //分类跳转
  handleItemLists(id, title) {
    Taro.navigateTo({
      url: `../itemLists/index?id=${id}&title=${title}`
    });
  }
  // 搜索框内容修改
  handleOnChange(e) {
    this.setState({
      input: e.detail.value
    });
  }
  async componentDidMount() {

    // 获取设备状态栏高度
    var that = this;
    wx.getSystemInfo({
      success(e) {
        console.log('设备状态栏高度e', e);
        console.log('设备状态栏高度this', this);
        that.setState({
          statusBar: e.statusBarHeight
        })
        console.log('setState statusBar');

      }
    })
    // 获取top Banner
    const result = await banners("top");
    this.setState({
      query: result
    });
    const centerImge = await homeCenterQuery("center");
    this.setState({
      centerQuery: centerImge
    });
    const bottomResult = await homeCenter("bottom");
    this.setState({
      bottomQuery: bottomResult
    });

    // 商品分类
    const classResult = await classify();
    this.setState({
      classifyQuery: classResult
    });

    // 商品
    const goods = await items(18, 1);
    console.log('首页商品goods', goods);

    this.setState({
      itemsQuery: goods
    });
  }

  // 会员活动
  TopUPGetMember() {
    const { myUserDetail } = this.state;
    Taro.checkSession({
      success() {
        if (myUserDetail.role === 'member') {
          Taro.navigateTo({
            url: "../theMemberCenter/index"
          });
        } else {
          Taro.navigateTo({
            url: '../../packageA/pages/topup/index'
          });
        }
      },
      fail() {
        Taro.showToast({
          title: "请跳转我的界面进行登录",
          icon: "none"
        });
      }
    })
  }

  // 监听用户滑动页面事件
  onPageScroll(e) {
    // console.log('监听用户滑动onPageScrollonPageScroll', e);
    const scrollTop = parseInt(e.scrollTop);
    const isSatisfy = scrollTop >= this.state.fixTop ? true : false;
    if (this.state.tabbarFix === isSatisfy) {
      return false;
    }
    this.setState({
      tabbarFix: isSatisfy
    })
  }
  // 手势触摸开始
  // onTouchStart(e){
  //   console.log('onTouchStart e',e);

  // }


  render() {
    const { cartItems } = this.props.common;
    // 购物车右上角图标
    if (cartItems.length === 0) {
      Taro.removeTabBarBadge({
        index: 2
      })
    } else {
      let sum = 0;
      let i;
      for (i in cartItems) {
        if (cartItems[i].checked) {
          sum += parseInt(cartItems[i].number);
        }
      }
      Taro.setTabBarBadge({
        index: 2,
        text: "" + sum + "",
      })
    }

    const {
      query,
      classifyQuery,
      itemsQuery,
      StoreName,
      projectItems1,
      projectItems2,
      projectItems3,
      tabbarFix,
      statusBar,
      ToUpper
    } = this.state;
    // 状态栏高度大于20 定义barHeight
    let barHeight = 32;
    if (statusBar > 20) {
      barHeight = barHeight + (statusBar - 20)
    }
    console.log('barHeight', barHeight);

    console.log('状态栏高度', statusBar);

    if (query.loading) {
      return Taro.showLoading({
        title: "加载中"
      });
    }
    else {
      Taro.hideLoading();
    }
    if (ToUpper) {
      return Taro.showLoading({
        title: "加载中"
      });
    }
    else {
      Taro.hideLoading();

    }

    const banners = query.data.banners;
    // const upper = 10
    return (
      <View
        className="index"

      // onTouchStart={this.onTouchStart}
      >
        {/* 轮播图 */}
        <Swiper
          indicatorColor="#333"
          indicatorActiveColor="#00bc71"
          circular
          indicatorDots
          autoplay
          style={
            statusBar <= 20 ?
              "width: 100%;height: 250PX;z-index: 1;"
              : `width: 100%;height: ${statusBar - 20 + 250}PX;z-index: 1;`
          }
          className="topBanner-box"
        >
          {banners.map(topBanner => (
            <SwiperItem key={topBanner.id}>
              <Image
                src={topBanner.imageUrl}
                style={
                  statusBar <= 20
                    ? 'width:100%;height:250PX;z-index:0;'
                    : `width:100%;height:${statusBar - 20 + 250}PX;z-index:0;`
                }
              />
            </SwiperItem>
          ))}
        </Swiper>
        <View
          className={tabbarFix ? 'absorption' : 'firstViewBox'} 
          style={
            tabbarFix ?
              `height:${statusBar - 20 + 115}Px;top:0;`
              :
              `top:${barHeight}PX;`
          }
          id="topTabBar"
        >

          <View 
            className='youDiDaoTitle'
            style={
              tabbarFix?
                `display: flex;justify-content: space-between;margin-top: ${statusBar - 20 + 33}PX;`
                :`display: flex;justify-content: space-between;margin: 9px;margin-top: 0;margin-left:15px;`
            }
          >
            <Text className="youDiDaoName">
              有地道门店平台
            </Text>
          </View>
          {/* 第一行地址扫码及取货 */}
          <View
            className={tabbarFix ? "firstAbsorption" : "firstLineView"}
            style={
              tabbarFix ?
                `display: flex;justify-content: space-between;margin: 9px;margin-left:15px;margin-top: ${statusBar - 20 + 16}PX;`
                : "display: flex;justify-content: space-between;margin: 9px;margin-top: 0;margin-left:15px;"
            }
          >
            <View
              className="firstLineLeft"
              onClick={this.nearbystores}
            >
              <Image src="https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/bottomIcon.png" className="storeIcon" />
              <Text />
              <Text className="chooseStore">
                {StoreName ? StoreName : '请选择店铺！'}
              </Text>
            </View>
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
                // disabled
                onConfirm={this.clickSearch}
              />
              <View className="firstLineLeft" onClick={this.lookForward}>
                <Image src={scan} className="scanIcon" />
              </View>
            </View>
          </View>
          {/* {tabbarFix ? null : (
            <View className='searchAscan'>
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
                  // disabled
                  onConfirm={this.clickSearch}
                />
              </View>
              <View className="firstLineLeft">
                <View className="firstLineLeft" onClick={this.lookForward}>
                  <Image src={scan} className="scanIcon" />
                  <Text className="sweep">扫码</Text>
                </View>
              </View>
            </View>
          )} */}
        </View>


        {/* 分类 */}
        <View className="Grid">
          {classifyQuery.data.classify.map(gir => (
            <View
              className="gird"
              onClick={this.handleItemLists.bind(this, gir.id, gir.title)}
              key={gir.id}
            >
              <Image src={gir.imageUrl} className="gird_img" />
              <Text className="grid_title">{gir.title}</Text>
            </View>
          ))}
        </View>

        {/* 横线 */}
        <View className="boldLine" />

        {/* 充值 */}
        <View
          className='bg_f5'
          onClick={this.TopUPGetMember}
        >
          <View className='TopUP'>
            <View style="flex-direction:row;align-items:center;display:flex;">
              <Image src={diamond} className="diamondImg" />
              <Text className='leftTopUp'>加入有地道会员·每月领99元专享券</Text>
            </View>
            <Text className='rightTopUp'>丨1折开卡</Text>
          </View>
        </View>


        {/* 横线 */}
        <View className="boldLine" />

        {/* 特色专区 */}
        <View className="SpecialZone">
          <View
            className="WithinSpecialZone"
            onClick={this.handleProject.bind(this, 1)}
          >
            <View className="TodaySpecial">
              <View className="TodaySpecialCode">
                <Text className="TodaySpecialTitle">每周新品</Text>
                <Text className="TodaySpecialLittle">低至一元起</Text>
              </View>
              <Text className="TodaySpecialCon">精选低价 持续热销</Text>
            </View>
            <View className="specialLeftBox">
              <Image src={projectItems1} className="leftSpecial" />
            </View>
          </View>
          <View className="WithinSpecialZone2">
            <View
              className="specialLeftBox1"
              onClick={this.handleProject.bind(this, 2)}
            >
              <View className="TodaySpecial">
                <View className="TodaySpecialCode">
                  <Text className="TodaySpecialTitle">品牌主打</Text>
                  <Text className="TodaySpecialLittle SpecialCoupon">领券超优惠</Text>
                </View>
                <Text className="TodaySpecialBrand">品牌特色 味蕾释放</Text>
              </View>
              <View className="SpecialZoneImg">
                <Image src={projectItems2[0].imageUrl} className="leftSpecial1" />
                <Image src={projectItems2[1].imageUrl} className="leftSpecial1" />
              </View>
            </View>
            <View className='divider'></View>
            <View
              className="specialLeftBox2"
              onClick={this.handleProject.bind(this, 3)}
            >
              <View className="TodaySpecial">
                <View className="TodaySpecialCode">
                  <Text className="TodaySpecialTitle">能量必备</Text>
                </View>
                <Text className="TodaySpecialBrand">能量加油站 精神整天</Text>
              </View>
              <View className="SpecialZoneImg">
                <Image src={projectItems3[0].imageUrl} className="leftSpecial1" />
                <Image src={projectItems3[1].imageUrl} className="leftSpecial1" />
              </View>
            </View>
          </View>
        </View>

        {/* 横线 */}
        <View className="boldLine" />

        {/* 为你优选 */}
        <View className="optimizationBox">
          <View className="optimizationLine">
            <View className="line" />
            <Text className="optimizationText">为你推荐</Text>
            <View className="line" />
          </View>
          <View className="items_box">
            {itemsQuery.data.items.list.map(item => (
              <View
                className="item_box"
                key={item.code}
              >
                <Image src={item.imageUrl} className="image" onClick={this.handleDetails.bind(this, item.code)} />
                <View className="item_bottom_box">
                  <Text className="title" onClick={this.handleDetails.bind(this, item.code)}>{item.name}</Text>
                  <View className="item_right_box">
                    <View className="priceBox">
                      <Text className="price">
                        ￥{(item.price / 100).toFixed(2)}/{item.unit}
                      </Text>
                      <Text className="originalPrice">
                        ￥{(item.originalPrice / 100).toFixed(2)}
                      </Text>
                    </View>
                    <View 
                      className="shoppingCart"
                      onClick={this.onOpenDoor.bind(this,
                        item.code,
                        item.name,
                        1,
                        item.price,
                        item.unit,
                        item.imageUrl,
                        item.pointDiscountPrice,
                        item.originalPrice,
                        item.memberPrice,
                      )}
                    >
                      <AtIcon value='shopping-cart' size='20' color='#fff'></AtIcon>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className='shoppingScan' onClick={this.lookForward}>
          <Image src={shoppingScan} />
          <Text className='shoppingScanTxt1'>扫一扫</Text>
          <Text className='shoppingScanTxt2'>商品条形码</Text>
        </View>
      </View>

    );
  }
}

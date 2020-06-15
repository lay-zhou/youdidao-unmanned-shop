import Taro, { Config } from "@tarojs/taro";
import {
  View,
  Text,
  Image,
  Button,
} from "@tarojs/components";
import { userInfo } from "../../../pages/orderDetails/service";
import { couponsList } from "../../../pages/gifts/service";
import { userTopUp } from "../prepaid/service";
import diamond from "../../../img/diamond.png";
import "./index.less";

// 引入moment
import moment from "moment";
moment.locale("zh-cn");

interface IState {
  myUserInfo?: any;
  data: any;
}

export default class Home extends Taro.Component<any, IState> {
  config: Config = {
    navigationBarTitleText: "会员列表",
    navigationBarBackgroundColor: "#002329",
    navigationBarTextStyle: "white",
  };

  async componentWillMount() {
    const userResult = await userInfo();
    const myUserInfo = userResult.data.userInfo;
    const result = await couponsList('special');
    const { issueCoupon } = result.data;
    this.setState({
      myUserInfo,
      data: issueCoupon
    })

  }

  // 开通会员
  async TopUpMember() {
    const user_TopUp = await userTopUp(10);
    const userTopUp1 = user_TopUp.data.userTopUp;
    const cancel = "requestPayment:fail cancel";
    try {
      await Taro.requestPayment(userTopUp1);
    } catch (error) {
      if (error.errMsg === cancel) {
        Taro.showToast({
          title: "用户取消了支付",
          icon: "none",
          duration: 1000
        });
      } else {
        Taro.showToast({
          title: "支付失败",
          icon: "none",
          duration: 1000,
          mask: true
        });
      }
    }
  }
  render() {
    const { myUserInfo, data } = this.state;
    console.log('myUserInfo',myUserInfo);
    

    const benefits = [
      {
        id: 1,
        ico: 'https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/benefits_1.png',
        name: '会员费返',
      },
      {
        id: 2,
        ico: 'https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/benefits_2.png',
        name: '专享优惠券',
      },
      {
        id: 3,
        ico: 'https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/benefits_3.png',
        name: '专享服务',
      },
      {
        id: 4,
        ico: 'https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/benefits_4.png',
        name: '购物折扣',
      },
    ];
    return (
      <View>
        {/* 会员介绍 */}
        <View className='top_bg'>
          <View className='memberTop'>
            <View className="optimizationLine">
              <View className="line" />
              <Image src={diamond} className="diamondImg" />
              <Text className="optimizationText">开通会员</Text>
              <View className="line" />
            </View>
            <Text className='memberTitle1'>每月预计可省99元</Text>
            <Text className='memberTitle2'>享3大专属权益，放心实惠</Text>
          </View>
        </View>
        {/* 会员时间 */}
        <View className='memberTime'>
          <Text className='coupons_num'></Text>
          <Text class="coupons_text">会员特权</Text>
        </View>
        {/* 会员优惠 */}
        <View className="benefits_view">
          {benefits.map(item => (
            <View className="benefits" key={item.id}>
              <Image src={item.ico} className="benefits_img" />
              <Text className="benefits_name">{item.name}</Text>
              <Text className="benefits_text">{item.text}</Text>
            </View>
          ))}
        </View>
        {/* 横线 */}
        <View className="boldLine" />  
        {/* 优惠券 */}
        <View className='coupons_title'>
          <Text className='coupons_num'></Text>
          <Text className='coupons_text'>专享优惠券</Text>
        </View>
        {/* 优惠券 */}
        <View className="oneCoupons">
          <View className="oneCoupons_left">
            ￥<Text className="price">15</Text>
          </View>
          <View className='oneCoupons_semicircle'>
            <View className='oneCoupons_top' />
            <View className='oneCoupons_bottom' />
          </View>
          <View className='oneCoupons_right'>
            <View className='oneCoupons_right_top'>
              <Text className='oneCoupons_title1'>满100减少15优惠券</Text>
              <Text className='oneCoupons_title2'>有效期至2019-09-30</Text>
              <Text className='oneCoupons_title3'>开卡领取</Text>
            </View>
          </View>
        </View>
        {/* 立刻开通 */}
        <View className='oneCoupons_topUp'>
          <Text className='oneCoupons_limited'>限时专享</Text>
          <Button
            className='openCard'
            onClick={this.TopUpMember}
          >开通会员 年卡仅需9.9元</Button>
        </View>
      </View>
    )
  }
}
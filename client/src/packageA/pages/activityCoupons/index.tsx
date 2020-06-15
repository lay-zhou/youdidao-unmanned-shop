import Taro, { Component } from "@tarojs/taro";
import { View, Text, Button, Input } from "@tarojs/components";
import "./index.less";
import { drawCard } from "./service";

var moment = require("moment");
moment.locale("zh-cn");

interface IState {
  data: any;
  value: any;
}
export default class activityCoupons extends Component<null, IState> {
  config = {
    navigationBarTitleText: "领取活动优惠券"
  };
  state = {
    data: [],
    value: ''
  };

  async componentWillMount() { }

  async clickReceive() {
    const { value } = this.state;
    var reg = /^[0-9]+.?[0-9]*$/;
    if (reg.test(value)) {
      try {
        await drawCard(value);
        Taro.showToast({
          title: "领取成功",
          icon: "none"
        });
      } catch (error) {
        Taro.showToast({
          title: error.graphQLErrors[0].message,
          icon: "none"
        });
      }
    }else{    
      Taro.showToast({
        title: "请输入正确的兑换码",
        icon: "none"
      });
    }
  }

  // 搜索框内容修改
  handleOnChange(e) {
    this.setState({
      value: e.detail.value
    });
  }

  render() {
    return (
      <View>
        <View className='code_view'>
          <Text>兑换码</Text>
          <Input
            placeholder='请输入兑换码'
            value={this.state.value}
            onInput={this.handleOnChange}
          />
        </View>
        <Text className='code_tips'>请输入六位数字，领取优惠券</Text>
        <Button 
          className='code_btn'
          onClick={this.clickReceive}
        >提交</Button>
      </View>
    );
  }
}


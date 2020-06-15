import Taro, { Component } from "@tarojs/taro";
import { View, RichText } from "@tarojs/components";
import "./index.less";
import { free } from "./service";

interface IState {
  about: any;
}
export default class agreement extends Component<null, IState> {
  config = {
    navigationBarTitleText: "用户协议"
  };
  state = {
    about: '',
  };
  async componentWillMount() {
    const {data} = await free();
    this.setState({
      about: data.config.value
    });
  }
  render() {
    const { about } = this.state;
    return (
      <View className="index">
      <RichText nodes={about} />
    </View>
    );
  }
}

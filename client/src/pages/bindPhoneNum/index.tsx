import { Button, View } from '@tarojs/components';
import Taro, { Component, Config } from '@tarojs/taro';
import './index.less';
import { bind } from './service';

interface IState {
  userCode: string;
}
export default class bindPhoneNum extends Component<null, IState> {
  config: Config = {
    navigationBarTitleText: '绑定手机号码',
  };

  state = {
    userCode: '',
  };

  async componentWillMount() {
    const res = await Taro.login();
    const code = res.code;
    this.setState({
      userCode: code,
    });
  }

  //获取用户手机号
  async getPhoneNumber(e) {
    const { userCode } = this.state;
    let iv = e.detail.iv;
    let encryptedData = e.detail.encryptedData;
    let code = userCode;
    const result = await bind(code, encryptedData, iv);
    let bindPhoneByUser = result.data.bindPhoneByUser.number
    Taro.setStorage({
      key: "number",
      data: bindPhoneByUser ,
    });
    if (result.data.bindPhoneByUser.number) {
      Taro.showToast({
        title: '绑定成功',
        icon: 'success',
        mask:true,
        duration:1000
      });
      setTimeout(() => {
        Taro.navigateBack({
          delta: 1
        })
      }, 800);
    }
  }

  render() {
    return (
      <View className="main">
        <View className="bindPhone">
          <View className="text1">绑定手机号，享受优质服务！</View>
          <View className="text2">
            为了给小伙伴们提供更好的服务，希望您可以绑定手机号！
          </View>
          <Button
            openType="getPhoneNumber"
            onGetPhoneNumber={this.getPhoneNumber}
            className="button"
          >
            一键绑定手机号
          </Button>
        </View>
      </View>
    );
  }
}

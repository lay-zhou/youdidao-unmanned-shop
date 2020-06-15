import { View, Image } from '@tarojs/components';
import Taro, { Component, Config } from '@tarojs/taro';
import './index.less';

interface IState {}
export default class GotoUs extends Component<null, IState> {
  config: Config = {
    navigationBarTitleText: '资质展示',
  };

  state = {};
  componentWillMount() {}

  render() {
    return (
      <View className="index">
        <Image src="https://mengmao-qingying-files.oss-cn-hangzhou.aliyuncs.com/business.jpg" mode="widthFix" className='img'/>
      </View>
    );
  }
}
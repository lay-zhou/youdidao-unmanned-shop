import Taro, { Component, Config } from "@tarojs/taro";
import { Button, View } from "@tarojs/components";
import "./index.less";
import { addAccount } from "./service";
import { AtInput } from 'taro-ui'

interface IState {
}
export default class certificates extends Component<any, IState>  {
    config: Config = {
        navigationBarTitleText: "绑定账户"
    };
    state = {
        name: '',
        account: '',
        phone: '',
        card: '',
    };

    async componentWillMount() { }

    async handeleClick() {
        const { name,account,phone,card } = this.state;
        const result = await addAccount(name, phone, account, card);
        if (result.data.addAccount) {
            Taro.showToast({
                title: "用户绑定成功",
                icon: "none",
                duration: 1000
            });
            Taro.setStorage({
                key: "name",
                data: name
              });
              Taro.setStorage({
                key: "account",
                data: account
              });
              Taro.navigateTo({
                url: "../withdrawal/index"
              });
        } else {
            Taro.showToast({
                title: "绑定失败",
                icon: "none",
                duration: 1000,
                mask: true
            });
        }
    }
    // 
    handleChange(key, value) {
        const obj = {};
        obj[key.key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <View className="index">
                <View className="ortherInformationBox">
                    <AtInput
                        name='name'
                        title='收款人'
                        type='text'
                        placeholder='请输入收款人姓名'
                        value={this.state.name}
                        onChange={this.handleChange.bind(this, { key: 'name' })}
                    />
                    <AtInput
                        name='account'
                        title='账户'
                        type='text'
                        placeholder='请输入账户'
                        value={this.state.account}
                        onChange={this.handleChange.bind(this, { key: 'account' })}
                    />
                    <AtInput
                        name='card'
                        title='银行卡号'
                        type='number'
                        placeholder='请输入银行卡号'
                        value={this.state.card}
                        onChange={this.handleChange.bind(this, { key: 'card' })}
                    />
                    <AtInput
                        name='phone'
                        title='手机号'
                        type='number'
                        placeholder='请输入手机号'
                        value={this.state.phone}
                        onChange={this.handleChange.bind(this, { key: 'phone' })}
                    />

                    <Button className="orderName" onClick={this.handeleClick}>立即绑定</Button>

                </View>
            </View>
        );
    }
}

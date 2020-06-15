import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import "./index.less";
import { collectionItems } from "./service";

interface IState {
  query: {
    data?: any;
  };
  list?: any;
}
export default class collection extends Component<null, IState> {
  config = {
    navigationBarTitleText: "收藏"
  };

  state = {
    query: {
      data: null,
      loading: true
    },
    list: []
  };

  async componentDidShow() {
    const result = await collectionItems(1);
    const list = result.data.items.list;
    this.setState({
      query: result,
      list: list
    });
  }

  async onReachBottom() {
    const { query, list } = this.state;
    const orderPagination = query.data.items.pagination;
    const total = orderPagination.total;
    const pageSize = orderPagination.pageSize;
    const loadCurrent = orderPagination.current + 1;
    const number = Math.ceil(total / pageSize);
    if (loadCurrent > number) {
      Taro.showToast({
        title: "加载完成！",
        icon: "none",
        duration: 500
      });
    } else {
      const loadResult = await collectionItems(loadCurrent);
      const loadList = list.concat(loadResult.data.items.list);
      this.setState({
        list: loadList,
        query: loadResult
      });
    }
  }

  async onPullDownRefresh() {
    const result = await collectionItems(1);
    const list = result.data.items.list;
    this.setState({
      query: result,
      list: list
    });
    setTimeout(() => {
      Taro.stopPullDownRefresh(); //停止下拉刷新
    }, 1000);
  }
  handlecLick(code) {
    Taro.navigateTo({
      url: `../details/index?code=${code}`
    });
  }

  render() {
    const { list } = this.state;
    return (
      <View className="index">
        {list.map(item => (
          <View
            key={item.code}
            className="list-box"
            onClick={this.handlecLick.bind(this, item.code)}
          >
            <View className="list-box-first">
              <Image src={item.imageUrl} className="listImg" />
              <View className="list-box-first-bottom">
                <Text className="bottom-name">{item.name}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

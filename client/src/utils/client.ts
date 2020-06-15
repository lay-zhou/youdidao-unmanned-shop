import Taro from '@tarojs/taro';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  // 服务端地址
  uri: 'http://xxx/graphql',
  fetch: (url, options) =>
    Taro.request({
      url,
      method: options.method,
      data: options.body,
      // header: options.headers,
      header: {
        ...options.headers,
        ...(Taro.getStorageSync('accessToken')
          ? { Authorization: `Bearer ${Taro.getStorageSync('accessToken')}` }
          : {}),
      },
    }).then(({ data, statusCode }) => {
      return {
        ok: () => {
          return statusCode >= 200 && statusCode < 300;
        },
        text: () => {
          return Promise.resolve(JSON.stringify(data));
        },
      };
    }),
});
export default client;
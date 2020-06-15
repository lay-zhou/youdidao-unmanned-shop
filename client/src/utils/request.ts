import Taro from '@tarojs/taro';
import { apiOrigin, noConsole } from '../config';

interface IOptions {
  method?:
    | 'OPTIONS'
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT'
    | undefined;
  data: object;
  withAccessToken?: boolean;
}

interface IHeader {
  'Content-Type': 'application/json';
  Authorization?: string;
}

export default async (
  path,
  options: IOptions = { method: 'GET', data: {}, withAccessToken: false },
) => {
  if (!noConsole) {
  }
  const header: IHeader = {
    'Content-Type': 'application/json',
  };
  if (options.withAccessToken) {
    header.Authorization = `Bearer ${Taro.getStorageSync('accessToken')}`;
  }
  const res = await Taro.request({
    url: apiOrigin + path,
    data: options.data,
    header,
    method: options.method,
  });
  try {
    const { statusCode, data } = res;
    if (statusCode >= 200 && statusCode < 300) {
      if (!noConsole) {
      }
      return data;
    } else {
      throw new Error(`网络请求错误，状态码${statusCode}`);
    }
  } catch (error) {}
};

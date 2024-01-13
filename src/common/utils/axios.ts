import axios, { AxiosRequestConfig } from 'axios';

import { WebSetting } from '../interface';
import { SignatureUtil } from './signature-util';

export type RequestConfig = AxiosRequestConfig & {
  remote?: boolean; // 开启则不使用接口防抖处理
  cache?: boolean; // 是否开启缓存
  setExpireTime?: number; // 接口设置缓存时间 单位:ms
};

const webSetting = window.webSetting as WebSetting;
const request = axios.create({
  baseURL: webSetting?.serviceUrl,
  timeout: webSetting?.timeout || 6000,
});

const errorHandler = () => {
  return Promise.reject();
};

request.interceptors.request.use(
  (config) => {
    if (config.url) {
      // 接口签名校验
      SignatureUtil.signature(config);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use((res) => {
  return res;
}, errorHandler);

export default request;
export { request as axios };

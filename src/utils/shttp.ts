import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import store from '../global';
import { User } from 'user-info';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  data: {
    list?: T[],
    info?: T
  };
};

type RequestMethod = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => Promise<T>;

let isRefreshing = false;

let requestQueue: { resolve: Function, reject: Function }[] = [];

const shttp = axios.create({
  baseURL: '/gw/meal/',
  withCredentials: false,
  timeout: 20000,
});

shttp.interceptors.request.use(
  (config) => {
    if (store.app.access_token) {
      config.headers['Authorization'] = 'Bearer ' + store.app.access_token;
    }
    return config;
  },
  (error) => {
    console.log(error, 'request error');
    return Promise.resolve(error);
  },
);

shttp.interceptors.response.use(
  async (response) => {
    const config = response.config;
    // 判断业务码：code === 101010 表示 token 过期
    if (response.config.url !== '/gw/user/oauth/refresh' && response.data.code === 101010 && !config._retry) {
      config._retry = true;
      if (isRefreshing) {
        // 正在刷新 token，将请求加入队列
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject });
        }).then(() => {
          return shttp(config);
        });
      }
      isRefreshing = true;
      try {
        const resp = await axios.post(`${store.app.baseURL}/gw/user/oauth/refresh`, null, {
          headers: { Authorization: store.app.refresh_token, }
        });
        if (resp && resp.data && resp.data.code === 0) {
          const tokens = resp.data.data;
          User.setAccessToken(tokens.access_token)
          User.setRefreshToken(tokens.refresh_token)
        }
        // 执行队列中的请求
        requestQueue.forEach(p => p.resolve());
        requestQueue = [];
        return shttp(config);
      } catch (err) {
        requestQueue.forEach(p => p.reject(err));
        requestQueue = [];
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    if (response.data.code === 101010) {
      User.setAccessToken('')
    }
    if (response.data.code === 101020) {
      User.setRefreshToken('')
    }
    return response.data;
  },
  (error) => {
    console.log(error, 'response error');
    return Promise.reject(error);
  },
);

type PureAxiosInstance = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T>>;
  post: RequestMethod;
  put: RequestMethod;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  patch: RequestMethod;
};

export default shttp as PureAxiosInstance;

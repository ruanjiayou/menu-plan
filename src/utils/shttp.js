import axios from 'axios';
import store from '../store';

let isRefreshing = false;
let requestQueue = [];

const shttp = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: false,
  timeout: 20000,
});

shttp.interceptors.request.use(
  (config) => {
    if (store.app.debug) {
      console.log(`${config.method} ${config.url}`);
    }
    if (store.user.access_token) {
      config.headers['Authorization'] = 'Bearer ' + store.user.access_token;
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
    if (store.app.debug) {
      // console.log(response.status, response.data);
    }
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
          headers: { Authorization: store.user.refresh_token, }
        });
        if (resp && resp.data && resp.data.code === 0) {
          const tokens = resp.data.data;
          store.user.setAccessToken(tokens.access_token);
          store.user.setRefreshToken(tokens.refresh_token);
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
    return response.data;
  },
  (error) => {
    console.log(error, 'response error');
    if (error.response) {
      if (error.response.data.code === 101020) {
        store.user.setAccessToken('');
      }
    } else {
    }
    return Promise.reject(error);
  },
);

/**
 * @typedef {import('axios').AxiosInstance} AxiosInstance
 * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
 * * @callback CustomRequest
 * <T = any>(config: AxiosRequestConfig) => Promise<T>
 * * @typedef {Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
 * get<T = any>(url: string, config?: AxiosRequestConfig): Promise<{success:boolean,code:number,message:string,data: {list:T[]}|{info:T}}>;
 * post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
 * put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
 * delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
 * patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
 * }} PureAxiosInstance
 */

/** @type {PureAxiosInstance} */
export default shttp;

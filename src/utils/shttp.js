import axios from 'axios';
import { User } from '../global/User';

let isRefreshing = false;
let requestQueue = [];

const shttp = axios.create({
  baseURL: '/gw/meal/',
  withCredentials: false,
  timeout: 20000,
});

shttp.interceptors.request.use(
  (config) => {
    if (User.access_token) {
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
          User.access_token = (tokens.access_token);
          User.refresh_token = (tokens.refresh_token);
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
        User.access_token = ('');
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

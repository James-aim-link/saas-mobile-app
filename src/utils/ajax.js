
import axios from 'axios';
import { storage } from './storage';
import ENV from '../config/env';

/**
 * AJAX Utility for Aim.Link Mobile
 * Standardized for PC 4.0 Backend Compatibility
 */

const instance = axios.create({
    baseURL: ENV.apiHost + ENV.baseApi,
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
instance.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getSession('token');
            const corpId = await storage.getSession('corpId');
            const user = await storage.getSession('user');

            if (token) {
                config.headers.token = token;
            }

            if (corpId) {
                config.headers.CORPID = corpId;
            }

            // Lang index: 1-zh_CN, 2-en
            const langMap = ['', 'zh_CN', 'en', 'zh_TW', 'ja'];
            const langIndex = user?.language !== undefined ? user.language : 1;
            config.headers.antsRegion = langMap[langIndex] || 'en';
            config.headers.version = 'mobile-v1.1';

            // URL Normalization: PC 4.0 gateway expects path without leading slash after baseURL
            let url = config.url || '';
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            if (url.startsWith(ENV.baseApi)) {
                url = url.substring(ENV.baseApi.length);
            }
            config.url = url;

            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
                CORPID: config.headers.CORPID,
                antsRegion: config.headers.antsRegion,
                data: config.data
            });

            return config;
        } catch (error) {
            console.error('Request Interceptor Error:', error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        const res = response.data;
        // console.log(`[API Response] ${response.config.url}`, res);

        // Success condition for PC 4.0 (code 0 or code 200 or specific success messages)
        const isSuccess = res.code === 0 || res.code === 200 ||
            res.msg === '操作成功' || res.msg === 'Success' ||
            res.code === '0';

        if (isSuccess) {
            return res.data !== undefined ? res.data : res;
        }

        // Auth errors
        if (res.code === 401 || res.code === 403) {
            console.warn('Authentication failed - Session expired');
            // storage.clear(); // Option to trigger logout
        }

        return Promise.reject(new Error(res.msg || `API Error ${res.code}`));
    },
    (error) => {
        console.error('API Network/Server Error:', error.message);
        return Promise.reject(error);
    }
);

export const POST = (url, data = {}, config = {}) => instance.post(url, data, config);
export const GET = (url, params = {}, config = {}) => instance.get(url, { params, ...config });

export default instance;

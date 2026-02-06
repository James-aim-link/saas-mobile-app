
import axios from 'axios';
import { storage } from './storage';
import ENV from '../config/env';

// Create axios instance
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

            // Default to English/International for mobile app overseas
            // PC mapping: ['', 'zh_CN', 'en', 'zh_TW', 'ja']
            // We'll default to 'en' (index 2) or use user setting
            const langMap = ['', 'zh_CN', 'en', 'zh_TW', 'ja'];
            const langIndex = user?.language || 2;

            config.headers.antsRegion = langMap[langIndex] || 'en';
            config.headers.version = 'mobile-v1';

            return config;
        } catch (error) {
            console.error('Error in request interceptor', error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        const res = response.data;

        // Handle standard API response format
        // { code: 200, data: ..., msg: ... }
        if (res.code === 200) {
            return res.data;
        }

        // Handle specific error codes
        if (res.code === 401 || res.code === 403) {
            // TODO: Handle logout / redirect to login
            console.warn('Session expired or unauthorized');
        }

        return Promise.reject(new Error(res.msg || 'Error'));
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

/**
 * POST request wrapper
 */
export const POST = (url, data = {}, config = {}) => {
    return instance.post(url, data, config);
};

/**
 * GET request wrapper
 */
export const GET = (url, params = {}, config = {}) => {
    return instance.get(url, { params, ...config });
};

export default instance;

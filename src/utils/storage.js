
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility for React Native using AsyncStorage
 * Replaces the synchronous localStorage/sessionStorage from PC web
 */
export const storage = {
    /**
     * Get value from session storage
     * @param {string} key 
     */
    getSession: async (key) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error reading value', e);
            return null;
        }
    },

    /**
     * Set value to session storage
     * @param {string} key 
     * @param {any} value 
     */
    setSession: async (key, value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error('Error saving value', e);
        }
    },

    /**
     * Remove value from session storage
     * @param {string} key 
     */
    removeSession: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing value', e);
        }
    },

    /**
     * Clear all storage
     */
    clear: async () => {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error('Error clearing storage', e);
        }
    }
};


import { POST } from '../utils/ajax';
import ENV from '../config/env';

/**
 * Get Mind Map List (side tree style)
 */
export const getMindMapListByUser = (params = { parentId: 0 }) => {
    return POST('mind/map/listByParentId', params);
};

/**
 * Create Mind Map
 */
export const addMindMap = (params) => {
    return POST('mind/map/createMapList', params);
};

/**
 * Update Mind Map
 */
export const updateMindMap = (params) => {
    return POST('mind/map/updateMapList', params);
};

/**
 * Delete Mind Map
 */
export const deleteMindMap = (params) => {
    return POST('mind/map/deleteMapList', params);
};

/**
 * Get Mind Map Detail (WBS Tree)
 */
export const getMindDetail = (mapId) => {
    return POST('mind/node/getMindMapTree', { mindMapId: mapId });
};

/**
 * Transform Map into Project
 */
export const transformToProject = (params) => {
    return POST('mind/node/transformIntoProject', params);
};

/**
 * Get Mind Map Timeline Logs
 */
export const getMindLogList = (params = {}) => {
    return POST('mind/node/getMindMapLog', params);
};

/**
 * Node specific operations
 */
export const addMindNode = (params) => {
    return POST('mind/node/add', params);
};

export const updateMindNode = (params) => {
    return POST('mind/node/update', params);
};

export const deleteMindNode = (params) => {
    return POST('mind/node/delete', params);
};

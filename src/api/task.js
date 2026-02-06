
import { POST } from '../utils/ajax';

const API = {
    getTaskList: 'taskinfo/list/search', // or /partner/business/list/search for partners
    getTaskDetail: 'project/task/v1/get_taskinfo_detail',
    getTaskCount: 'taskinfo/list/search/count',
};

/**
 * Get task list for a project
 * @param {object} params 
 * { 
 *   pageNo, pageSize, 
 *   projectId, 
 *   ...other filters 
 * }
 */
export function getTaskList(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 20;

    return POST(`${API.getTaskList}?pageNo=${pageNo}&pageSize=${pageSize}`, params);
}

/**
 * Get task counts (groups)
 * @param {object} params
 */
export function getTaskCount(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 20;
    return POST(`${API.getTaskCount}?pageNo=${pageNo}&pageSize=${pageSize}`, params);
}

/**
 * Get task details
 * @param {string} id Task ID
 */
export function getTaskDetail(id) {
    return POST(API.getTaskDetail, { id });
}

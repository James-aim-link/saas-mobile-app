
import { POST } from '../utils/ajax';

const API = {
    getTaskList: 'taskinfo/list/search',
    getTaskDetail: 'project/task/v1/get_taskinfo_detail',
    getTaskCount: 'taskinfo/list/search/count',
    getMyTodo: 'todo/query',
    getTodoCount: 'todo/count',
    updateTask: 'taskinfo/updateQuickTaskinfo', // Updated for PC 4.0 compatibility
    deleteTask: 'taskinfo/deleteTaskinfo',      // Updated for PC 4.0 compatibility
    createTask: 'taskinfo/insertQuickTaskinfo',
    getTaskLogList: 'project/task/log/getAntLogList',
};

/**
 * Get task list for a project
 */
export function getTaskList(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 50;
    return POST(`${API.getTaskList}?pageNo=${pageNo}&pageSize=${pageSize}`, params);
}

/**
 * Get task details
 */
export function getTaskDetail(id) {
    return POST(API.getTaskDetail, { id });
}

/**
 * Create a new task (Quick)
 */
export function createTask(params) {
    return POST(API.createTask, params);
}

/**
 * Update task info
 */
export function updateTask(params) {
    return POST(API.updateTask, params);
}

/**
 * Delete task
 */
export function deleteTask(id) {
    return POST(API.deleteTask, { id });
}

/**
 * Get personal todo tasks (PC 4.0 style)
 */
export function getMyTodo(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 20;

    const body = {
        viewType: params.viewType || '2',
        data: params.data || { type: '0', showType: '1' }
    };

    return POST(`${API.getMyTodo}?pageNo=${pageNo}&pageSize=${pageSize}`, body);
}

/**
 * Get task logs (Timeline)
 */
export function getTaskLogList(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 20;
    return POST(`${API.getTaskLogList}/${pageNo}/${pageSize}`, params);
}

/**
 * Get personal todo task counts
 */
export function getTodoTaskCount() {
    return POST(API.getTodoCount);
}

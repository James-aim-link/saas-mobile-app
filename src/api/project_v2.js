
import { POST } from '../utils/ajax';

/**
 * Get project list (paged)
 */
export function getProjectList(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 50;
    return POST(`project/findPage?pageNo=${pageNo}&pageSize=${pageSize}`, params, { notTemp: true });
}

/**
 * Get project details
 */
export function getProjectDetail(id) {
    return POST('project/findSimpleProject', { id });
}

/**
 * Create a new project
 */
export function createProject(params) {
    return POST('project/save', params);
}

/**
 * Update project field (e.g. status, name)
 */
export function updateProjectField(params) {
    return POST('project/saveSimple', params);
}

/**
 * Star/Collect project
 */
export function addCollect(id) {
    return POST('collect/addCollect', { id });
}

/**
 * Unstar/Cancel collect
 */
export function cancelCollect(id) {
    return POST('collect/cancelCollect', { id });
}

/**
 * Delete project
 */
export function deleteProject(id) {
    return POST('project/delete', { id });
}

/**
 * Archive project
 */
export function archiveProject(id) {
    return POST('project/archive', { id });
}

/**
 * Unarchive project
 */
export function unarchiveProject(id) {
    return POST('project/unarchive', { id });
}

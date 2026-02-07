
import { POST } from '../utils/ajax';

/**
 * Get data overview counts (Ongoing, Completed, etc.)
 */
export function getDataCount(params = {}) {
    // Aligned with PC 4.0: taskinfo/menu/statistic/info
    return POST('taskinfo/menu/statistic/info', params);
}

/**
 * Get project list (can be used for recent projects)
 */
export function getRecentProjects(params = {}) {
    return POST(`project/findPage?pageNo=1&pageSize=5`, {
        ...params,
        sortField: 'update_time',
        sortOrder: 'desc'
    });
}

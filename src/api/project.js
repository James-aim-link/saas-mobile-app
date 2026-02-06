
import { POST } from '../utils/ajax';

/**
 * Get project list (paged)
 * @param {object} params { pageNo, pageSize, ...filters }
 */
export function getProjectList(params = {}) {
    const pageNo = params.pageNo || 1;
    const pageSize = params.pageSize || 20;

    return POST(`/project/findPage?pageNo=${pageNo}&pageSize=${pageSize}`, params, { notTemp: true });
}

/**
 * Get project details
 * @param {string} id Project ID
 */
export function getProjectDetail(id) {
    // Pass object as body based on PC usage: POST(url, id) -> usually implies body is id or {id}
    // PC code: return POST(`${API.getProDetail}`, id)
    // If 'id' is a string, axios might send it as keys if not wrapped, but usually backend expects JSON.
    // Let's assume it expects { id: "..." } or similar if it is a POST. 
    // Wait, in PC code: getProDetail(id) -> POST(url, id). 
    // If id is string "xxx", body is "xxx". 
    // But usually Java Spring @RequestBody expects an object. 
    // Let's look at getProjectList usage: POST(..., params).
    // Safest is to wrap in object if standard, but if legacy code sends raw string, we might need to match.
    // However, most saas-app controllers like 'project/exist' take { id }.
    // Let's assume it takes an ID string as body or {id: ...}. 
    // Checking `findSimpleProject` typical usage... assuming {id} for safety or the raw string if strict.
    // I will assume { id } for now as it's cleaner JSON.
    return POST('project/findSimpleProject', { id });
}

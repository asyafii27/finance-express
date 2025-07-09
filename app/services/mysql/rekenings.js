const { countData } = require('../../helpers/generalHelper');

const getAllRekenings = async (page = 1, limit = 10, filters = {}) => {
    let tableName = 'rekenings';

    const offset = (page - 1) * limit;
    let params = [];
    let whereClause = '';
    let conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        params.push(filters.id);
    }

    if (filters.is_self_rekening) {
        conditions.push('is_self_rekening = ?');
        params.push(String(filters.is_self_rekening));
    }

    if (filters.company_id) {
        conditions.push('company_id = ?');
        params.push(String(filters.company_id));
    }

    if (conditions.length > 0) {
        whereClause = 'where ' + conditions.join(' AND ');
    }

    const dataQuery = `select * from ${tableName} ${whereClause} order by created_at desc limit ? offset ?`;
    const dataParams = [...params, limit, offset];

    const results = countData(whereClause, params, dataQuery, dataParams, tableName);

    return results;
}

module.exports = { getAllRekenings };
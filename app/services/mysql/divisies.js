const { countData } = require('../../helpers/generalHelper');

const getAllDivisies = async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let params = [];
    let conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        params.push(filters.id);
    }

    if (filters.name) {
        conditions.push('nama LIKE ?');
        params.push(`%${filters.name}%`);
    }

    if (filters.type_txt) {
        conditions.push('type_txt LIKE ?');
        params.push(`%${filters.type_txt}%`);
    }

    let whereClause = '';

    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const dataQuery = `select * from divisis ${whereClause} order by created_at desc limit ? offset ?`;
    const dataParams = [...params, limit, offset];

    results = countData(whereClause, params, dataQuery, dataParams, 'divisis');

    return results;
}

module.exports = { getAllDivisies };
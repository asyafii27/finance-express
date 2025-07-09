const { countData } = require('../../helpers/generalHelper');

const getAllProducts = async(page = 1, limit = 10, filters = {}) => {
    let tableName = 'produks';

    const offset = (page - 1) * limit;
    let params = [];
    let whereClause = '';
    let conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        params.push(filters.id);
    }

    if (filters.type) {
        conditions.push('type = ?');
        params.push(String(filters.type));
    }

    if (filters.name) {
        conditions.push('nama like ?');
        params.push(`%${filters.name}%`);
    }

    if (filters.code) {
        conditions.push('code = ?');
        params.push(filters.code);
    }

    if (filters.category_id) {
        conditions.push('category_id = ?');
        params.push(filters.category_id);
    }

    if (filters.is_dynamic_price) {
        conditions.push('is_dynamic_price = ?');
        params.push(String(filters.is_dynamic_price));
    }

    if (conditions.length > 0) {
        whereClause = 'where ' + conditions.join(' AND ');
    }

    const dataQuery = `select * from ${tableName} ${whereClause} order by created_at desc limit ? offset ?`;
    const dataParams = [...params, limit, offset];

    const results = countData(whereClause, params, dataQuery, dataParams, tableName);

    return results;
}

module.exports = { getAllProducts };
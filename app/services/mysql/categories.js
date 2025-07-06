const { countData } = require('../../helpers/generalHelper');

const getAllCategories = async (page = 1, limit = 10, filters = {}) => {
    let tableName = 'categories';

    const offset = (page - 1) * limit;
    let params = [];
    let whereClause = '';
    let conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        params.push(filters.id);
    }

    if (filters.name) {
        conditions.push('nama LIKE ?');
        params.push(`%${filters.name}%`);
    }

    if (filters.divisi_id) {
        conditions.push('divisi_id = ?');
        params.push(filters.divisi_id);
    }

    if (filters.is_ads_rule) {
        conditions.push('is_ads_rule = ?');
        params.push(filters.is_ads_rule);
    }

    if (filters.is_beban_gaji) {
        conditions.push('is_beban_gaji = ?');
        params.push(String(filters.is_beban_gaji));
    }

    if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const dataQuery = `select * from ${tableName} ${whereClause} order by created_at desc limit ? offset ?`;
    const dataParams = [...params, limit, offset];

    results = countData(whereClause, params, dataQuery, dataParams, tableName);

    return results;
}

module.exports = { getAllCategories };
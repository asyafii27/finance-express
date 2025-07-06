const { where } = require('sequelize');
const db = require('../../../db');
const Logger = require('../../helpers/winston');

function formatQuery(query, params) {
    let i = 0;
    return query.replace(/\?/g, () => {
        const param = params[i++];

        if (typeof param === 'string') return `'${param}'`;

        return param;
    });
}

const getAllTipes = async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let params = [];

    let whereClause = '';

    if (filters.nama) {
        whereClause = 'Where nama LIKE ?';
        param.push(`%${filters.nama}%`);
    }

    // query data 
    const dataQuery = `select * from tipes ${whereClause} order by created_at desc limit ? offset ?`;
    const dataParams = [...params, limit, offset];

    // query count 
    const countQuery = `select count(*) as total from tipes ${whereClause}`;
    const countParams = [...params];

    return new Promise((resolve, reject) => {
        // log query yang sudah terisi param
        Logger.info('FULL QUERY:', formatQuery(dataQuery, dataParams));
        db.query(dataQuery, dataParams, (error, results) => {
            if (error) return reject(error);
            Logger.info('FULL COUNT QUERY:', formatQuery(countQuery, countParams));

            db.query(countQuery, countParams, (error2, countResult) => {
                if (error2) return reject(error2);
                resolve({
                    data: results,
                    total: countResult[0].total
                });
            });
        });
    });
}

module.exports = {
    getAllTipes
}
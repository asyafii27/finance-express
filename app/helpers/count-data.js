// helpers/generalHelper.js
const db = require('../../db2');
const Logger = require('./winston');

function formatQuery(query, params) {
    // Untuk debugging query final
    return query.replace(/\?/g, () => `'${params.shift()}'`);
}

async function countData(whereClause, params, dataQuery, dataParams, tableName) {
    const countQuery = `SELECT COUNT(*) AS total FROM ${tableName} ${whereClause}`;
    const countParams = [...params];

    Logger.info('FULL QUERY:', formatQuery(dataQuery, [...dataParams]));
    Logger.info('FULL COUNT QUERY:', formatQuery(countQuery, [...countParams]));

    const [dataRows] = await db.query(dataQuery, dataParams);
    const [countRows] = await db.query(countQuery, countParams);

    return {
        data: dataRows,
        total: countRows[0].total
    };
}

module.exports = { countData };

const db = require('../../db');
const Logger = require('./winston');


function formatQuery(query, params) {
    let i = 0;
    return query.replace(/\?/g, () => {
        const param = params[i++];
        if (typeof param === 'string') return `'${param}'`;
        return param;
    });
}

function countData(whereClause, params, dataQuery, dataParams, tableName) {
    // query count 
    const countQuery = `select count(*) as total from ${tableName} ${whereClause}`;
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

function successResponse(res, status = 200, message = 'success', data = [], paginate = null) {
    let response = {
        status: status,
        message: message,
        data: data.data,
    };

    if (paginate) {
        const { page = 1, limit = 10 } = paginate;
        response.meta = {
            total: data.total ?? 0,
            page: page,
            limit: limit,
            totalPages: Math.ceil((data.total ?? 0) / limit),
        };

        if (Array.isArray(data.data)) {
            response.data = data.data;
        }
    }

    return res.status(status).json(response);
}

function errorResponse(res, status = 500, message = 'Internal Server Error', errors = null) {
    let response = {
        status: status,
        message: message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(status).json(response);
}



module.exports = { formatQuery, countData, successResponse, errorResponse };
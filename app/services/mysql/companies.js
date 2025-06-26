const { where } = require('sequelize');
const db = require('../../../db');
const { param } = require('../../api/company/CompanyRouter');

function formatQuery(query, params) {
    let i = 0;
    return query.replace(/\?/g, () => {
        const param = params[i++];
        if (typeof param === 'string') return `'${param}'`;
        return param;
    });
}

const getAllCompanies = async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let params = [];
    let whereClause = '';

    if (filters.nama) {
        whereClause = 'WHERE nama LIKE ?';
        params.push(`%${filters.nama}%`);
    }

    // Query data
    const dataQuery = `SELECT * FROM companies ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];

    // Query count
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const countParams = [...params];

    return new Promise((resolve, reject) => {
        // Log query yang sudah terisi param
        console.log('FULL QUERY:', formatQuery(dataQuery, dataParams));
        db.query(dataQuery, dataParams, (error, results) => {
            if (error) return reject(error);

            console.log('FULL COUNT QUERY:', formatQuery(countQuery, countParams));
            db.query(countQuery, countParams, (error2, countResult) => {
                if (error2) return reject(error2);
                // console.log('countResult: ', countResult[0].total)

                resolve({
                    data: results,
                    total:  countResult[0].total,
                });
            });
        });
    });
};

const createCompany = async (data) => {
    console.log('masuk services');
    const { nama, code } = data;
    const query = 'insert into companies (nama, code, created_at, updated_at) values (?, ?, NOW(), NOW())';
    const params = [nama, code];
    return new Promise((resolve, reject) => {
        console.log('Full insert query: ', formatQuery(query, params));
        db.query(query, params, (error, result) => {
            if (error) return reject(error);
            resolve({ id: result.insertId, ...data })
        });
    });

}

const updateCompany = async (id, data) => {
    const { nama, code } = data;
    const query = 'update companies set nama = ?, code = ?, updated_at = NOW() where id = ?';
    const params = [nama, code, id];

    return new Promise((resolve, reject) => {
        console.log('full update query:', formatQuery(query, params));
        db.query(query, params, (error, result) => {
            if (error) return reject(error);
            resolve({ id, ...data, affectedRows: result.affectedRows });
        })
    })
}

const deleteCompany = async (id) => {
    const query = 'delete from companies where id = ?';
    const params = [id];

    return new Promise((resolve, reject) => {
        db.query(query, params, (error, result) => {
            if (error) return reject(error);

            resolve({ id, affectedRows: result.affectedRows });
        });
    })
}

module.exports = { getAllCompanies, createCompany, updateCompany, deleteCompany };
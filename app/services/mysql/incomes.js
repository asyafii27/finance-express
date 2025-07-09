const { formatNamedParameters } = require('sequelize/lib/utils');
const { countData } = require('../../helpers/count-data');
const db = require('../../../db2');
const mysql = require('mysql2/promise');

const getAllIncomes = async (page = 1, limit = 1, filters = {}) => {
    let tableName = 'transaksis';

    const offset = (page - 1) * limit;
    const params = [];
    let conditions = [];
    let whereClause = '';

    if (filters.id) {
        conditions.push('t.id = ?');
        params.push(filters.id);
    }

    if (filters.transaction_code) {
        conditions.push('t.transaction_code LIKE ?');
        params.push(`%${filters.transaction_code}%`);
    }

    if (filters.date_start) {
        conditions.push('t.tanggal >= ?');
        const formattedStartDate = formatDateToYMD(filters.date_start);
        params.push(formattedStartDate);
    }

    if (filters.date_end) {
        conditions.push('t.tanggal <= ?');
        const formattedDateEnd = formatDateToYMD(filters.date_end);
        params.push(formattedDateEnd);
    }

    if (filters.company_id) {
        conditions.push('t.company_id = ?');
        params.push(filters.company_id);
    }

    if (filters.divisi_id) {
        conditions.push('t.divisi_id = ?');
        params.push(filters.divisi_id);
    }

    if (filters.category_id) {
        conditions.push('t.category_id = ?');
        params.push(filters.category_id);
    }

    if (filters.is_expenditure) {
        conditions.push('t.is_expenditure = ?');
        params.push(String(filters.is_expenditure));
    }

    if (conditions.length > 0) {
        whereClause = 'where ' + conditions.join(' AND ');
    }

    // JOIN companies
    const dataQuery = `
        SELECT t.*, c.id as company_id, c.nama as company_name
        FROM ${tableName} t
        LEFT JOIN companies c ON t.company_id = c.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];

    // Jalankan query, misal pakai mysql2/promise
    const [rows] = await db.query(dataQuery, dataParams);

    // Nest company object
    const results = rows.map(row => {
        const { company_id, company_name, ...income } = row;
        return {
            ...income,
            company: {
                id: company_id,
                name: company_name
            }
        };
    });

    return {
        data: results,
        total: results.length,
    };
}

module.exports = { getAllIncomes };
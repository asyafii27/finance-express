const db = require('../../../db');
const formatQuery = require('../../helpers/generalHelper');
const { generateTransactionCode } = require('../../helpers/codeGenerator');
const { BAD_GATEWAY } = require('http-status-codes');

const getAllExpenditures = async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let params = [];
    let whereParts = ["t.is_expenditure = '1'"];

    if (filters.company_id) {
        whereParts.push('t.company_id = ?');
        params.push(filters.company_id);
    }

    if (filters.divisi_id) {
        whereParts.push("t.divisi_id = ?");
        params.push(filters.divisi_id); s
    }

    const whereClause = whereParts.length ? `${whereParts.join(' AND ')}` : '';
    console.log('wheereclause: ', whereClause);

    const dataQuery = `
    SELECT 
        t.*, 
        c.nama as company_name, 
        c.code as company_code
    FROM 
        transaksis as t
    LEFT JOIN 
        companies as c ON t.company_id = c.id
    WHERE 
        ${whereClause}
    LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    return new Promise((resolve, reject) => {
        console.log('full query: ', formatQuery(dataQuery, params));

        db.query(dataQuery, params, (error, results) => {
            if (error) return reject(error);

            const countQuery = `select count(*) as total from transaksis as t Where ${whereClause}`;
            const countParams = whereClause ? [params[0]] : [];

            db.query(countQuery, countParams, (error2, countResult) => {
                if (error2) return reject(error2);

                resolve({
                    data: results,
                    total: countResult[0].total
                })
            })
        })
    })

}

const createExpenditure = async (data) => {

    console.log('data request: ', data);

    const { produks, transacationCode, ...mainData } = data;

    let getTransacationCode = await generateTransactionCode(1);

    const insertData = {
        ...mainData,
        is_expenditure: '1',
        transaction_code: getTransacationCode,
        created_at: new Date(),
        updated_at: new Date()
    }

    const fields = Object.keys(insertData);
    const values = Object.values(insertData);

    const placeholders = fields.map(() => '?').join(', ');

    const insertQuery = `
        insert into transaksis (${fields.join(', ')})
        values (${placeholders})
    `;

    return new Promise((resolve, reject) => {
        db.query(insertQuery, values, (error, result) => {
            if (error) return reject(error);

            const transaksiId = result.insertId;

            // jika ada produk, inset data ke tabel detail
            if (Array.isArray(produks) && produks.length > 0) {
                const detailValues = produks.map(produk => [
                    transaksiId,
                    produk.produk_id,
                    produk.nominal,
                    produk.qty,
                    produk.nominal_discount,
                    produk.qty * produk.nominal,
                    (produk.qty * produk.nominal) - produk.nominal_discount,
                    'ahmad_express',
                    'ahmad_express',
                    new Date,
                    new Date
                ]);

                const detailQuery = `
                insert into produk_transaksi 
                (transaksi_id, produk_id, nominal, qty, nominal_discount, total_nominal, total_nominal_after_discount, created_by, updated_by, created_at, updated_at)
                values ?`;
                db.query(detailQuery, [detailValues], (error2) => {
                    if (error2) return reject(error2);
                    resolve({ id: transaksiId, ...insertData, produks });
                })
            } else {
                resolve({ id: transaksiId, ...insertData })
            }
        })
    })
}

const updateExpenditure = async (id, data) => {
    const { produks, ...mainData } = data;

    mainData.updated_at = new Date();

    const fields = Object.keys(mainData);
    const values = Object.values(mainData);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const updateQuery = `
        UPDATE transaksis
        SET ${setClause}
        WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
        db.query(updateQuery, [...values, id], (error, result) => {
            if (error) return reject(error);

            if (Array.isArray(produks) && produks.length > 0) {
                const deleteDetailQuery = `DELETE FROM produk_transaksi WHERE transaksi_id = ?`;
                db.query(deleteDetailQuery, [id], (errDel) => {
                    if (errDel) return reject(errDel);

                    const detailValues = produks.map(produk => [
                        id,
                        produk.produk_id,
                        produk.nominal,
                        produk.qty,
                        produk.nominal_discount,
                        produk.qty * produk.nominal,
                        (produk.qty * produk.nominal) - produk.nominal_discount,
                        'ahmad_express',
                        'ahmad_express',
                        new Date(),
                        new Date()
                    ]);
                    const detailQuery = `
                        INSERT INTO produk_transaksi 
                        (transaksi_id, produk_id, nominal, qty, nominal_discount, total_nominal, total_nominal_after_discount, created_by, updated_by, created_at, updated_at)
                        VALUES ?
                    `;
                    db.query(detailQuery, [detailValues], (errIns) => {
                        if (errIns) return reject(errIns);
                        resolve({ id, ...mainData, produks });
                    });
                });
            } else {
                resolve({ id, ...mainData });
            }
        });
    });
};

const deleteExpenditure = async (id) => {
    return new Promise((resolve, reject) => {
        // delete first detail data in produk tranaksi
        const deleteDetailQuery =  `delete from produk_transaksi where transaksi_id = ?`;
        db.query(deleteDetailQuery, [id], (errDetail) => {
            if (errDetail) return reject (errDetail);

            // delete main data
            const deleteMainQuery = `delete from transaksis where id= ?`;
            db.query(deleteMainQuery, [id], (errMain) => {
                if (errMain) return reject(errMain)
                resolve({
                    status: 'OK',
                    message: 'SUkses',
                    data: []
                })
            })
        })
    })
}

module.exports = { getAllExpenditures, createExpenditure, updateExpenditure, deleteExpenditure }
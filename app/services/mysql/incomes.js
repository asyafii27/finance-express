const { formatNamedParameters } = require('sequelize/lib/utils');
const { countData } = require('../../helpers/count-data');
const db = require('../../../db2');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('./user')


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
        SELECT t.*, pt.*, 
        u.id as user_id,
        tp.id as tipe_id, 
        tp.nama as tipe_name,
        u.name as user_name,
        c.id as company_id,
        c.code as company_code,
        d.id as divisi_id, 
        d.nama as divisi_name, 
        cat.id as category_id,
        cat.nama as category_name,
        pt.produk_id as produk_id,
        p.nama as produk_name,
        r.id as rekenig_id,
        r.nomor as rekening_nomor,
        r.code as rekening_code

        FROM ${tableName} t
        left join tipes as tp on t.tipe_id = tp.id
        LEFT JOIN companies c ON t.company_id = c.id
        left join users as u on t.user_id = u.id
        left join divisis as d on t.divisi_id = d.id
        left join categories as cat on t.category_id = cat.id
        left join produk_transaksi as pt on t.id = pt.transaksi_id
        left join produks as p on pt.produk_id = p.id
        left join rekenings as r on t.rekening_id = r.id
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

const createIncome = async (data, user) => {
    const [categoryRows] = await db.query(
        'select * from categories where id = ?',
        [data.category_id]
    )
    if (categoryRows.length === 0) throw new Error('Ketagori tidak ditemukan');
    const tipeId = categoryRows[0].tipe_id;

    const [customerRows] = await db.query(
        'select * from clients where id = ?',
        [data.customer_id]
    )
    if (customerRows.length === 0) throw new Error('Customer tidak ditemukan');
    const customerName = customerRows[0].name;

    const [divisiRows] = await db.query(
        'select * from divisis where id = ?',
        [data.divisi_id]
    );
    if (divisiRows.length === 0) throw new Error('Divisi tidak ditemukan');
    const divisiName = divisiRows[0].nama;

    const nominal = Number(data.produk.nominal) || 0;
    const qty = Number(data.produk.qty) || 0;
    const nominalDiscount = Number(data.produk.nominal_discount) || 0;

    const totalNominal = nominal * qty;
    const totalNominalAfterDiscount = totalNominal - nominalDiscount;
    const nominalAfterAdminfee = totalNominalAfterDiscount;

    const insertTransaksiQuery = `
        INSERT INTO transaksis 
            (tanggal, customer_id, customer_name, user_id, transaction_code, company_id, tipe_id, rekening_id, divisi_id, divisi, category_id, nominal, nominal_after_discount, nominal_after_admin_fee, keterangan, url_foto, created_by, created_at, updated_at)
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?, 
            ?,
            ?, 
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW(),
            NOW()
        )
    `;

    const transactionCode = await generateTransactionCode('IN');
    const transaksiParams = [
        data.tanggal,
        data.customer_id,
        customerName,
        user.id,
        transactionCode,
        data.company_id,
        tipeId,
        data.rekening_id,
        data.divisi_id,
        divisiName,
        data.category_id,
        data.produk.nominal,
        totalNominalAfterDiscount,
        nominalAfterAdminfee,
        data.keterangan || null,
        data.url_foto || null,
        user.email
    ];

    const [transaksiResult] = await db.query(insertTransaksiQuery, transaksiParams);
    const transaksiId = transaksiResult.insertId;

    // 2. Insert ke tabel produk_transaksi
    const insertProdukTransaksiQuery = `
        INSERT INTO produk_transaksi
            (transaksi_id, produk_id, qty, nominal, nominal_discount, total_nominal, total_nominal_after_discount, created_by, created_at, updated_at)
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW(), 
            NOW()
        )`;

    const produkParams = [
        transaksiId,
        data.produk.produk_id,
        data.produk.qty || 1,
        data.produk.nominal,
        data.produk.nominal_discount || 0,
        totalNominal,
        totalNominalAfterDiscount,
        user.email
    ];
    await db.query(insertProdukTransaksiQuery, produkParams);
    console.log('transaksiId: ', transaksiId);


    // 3. Ambil data transaksi yang baru saja di-insert (optional)
    const [rows] = await db.query(
        `SELECT * FROM transaksis WHERE id = ?`,
        [transaksiId]
    );

    return rows[0];
};

const updateIncome = async (id, data, user) => {
    const [existing] = await db.query('SELECT * FROM transaksis WHERE id = ?', [id]);
    if (existing.length === 0) {
        throw new Error('Transaksi tidak ditemukan');
    }

    const [categoryRows] = await db.query('SELECT * FROM categories WHERE id = ?', [data.category_id]);
    if (categoryRows.length === 0) throw new Error('Kategori tidak ditemukan');
    const tipeId = categoryRows[0].tipe_id;

    const [customerRows] = await db.query('SELECT * FROM clients WHERE id = ?', [data.customer_id]);
    if (customerRows.length === 0) throw new Error('Customer tidak ditemukan');
    const customerName = customerRows[0].name;

    const [divisiRows] = await db.query('SELECT * FROM divisis WHERE id = ?', [data.divisi_id]);
    if (divisiRows.length === 0) throw new Error('Divisi tidak ditemukan');
    const divisiName = divisiRows[0].nama;

    const nominal = Number(data.produk.nominal) || 0;
    const qty = Number(data.produk.qty) || 0;
    const nominalDiscount = Number(data.produk.nominal_discount) || 0;

    const totalNominal = nominal * qty;
    const totalNominalAfterDiscount = totalNominal - nominalDiscount;
    const nominalAfterAdminfee = totalNominalAfterDiscount;

    const updateTransaksiQuery = `
        UPDATE transaksis SET
            tanggal = ?,
            customer_id = ?,
            customer_name = ?,
            user_id = ?,
            company_id = ?,
            tipe_id = ?,
            rekening_id = ?,
            divisi_id = ?,
            divisi = ?,
            category_id = ?,
            nominal = ?,
            nominal_after_discount = ?,
            nominal_after_admin_fee = ?,
            keterangan = ?,
            url_foto = ?,
            updated_at = NOW(),
            updated_by = ?
        WHERE id = ?
    `;

    const transaksiParams = [
        data.tanggal,
        data.customer_id,
        customerName,
        user.id,
        data.company_id,
        tipeId,
        data.rekening_id,
        data.divisi_id,
        divisiName,
        data.category_id,
        data.produk.nominal,
        totalNominalAfterDiscount,
        nominalAfterAdminfee,
        data.keterangan || null,
        data.url_foto || null,
        user.email,
        id
    ];

    await db.query(updateTransaksiQuery, transaksiParams);

    // Update produk_transaksi
    const updateProdukQuery = `
        UPDATE produk_transaksi SET
            produk_id = ?,
            qty = ?,
            nominal = ?,
            nominal_discount = ?,
            total_nominal = ?,
            total_nominal_after_discount = ?,
            updated_at = NOW(),
            updated_by = ?
        WHERE transaksi_id = ?
    `;

    const produkParams = [
        data.produk.produk_id,
        qty,
        nominal,
        nominalDiscount,
        totalNominal,
        totalNominalAfterDiscount,
        user.email,
        id
    ];

    await db.query(updateProdukQuery, produkParams);

    const [rows] = await db.query('SELECT * FROM transaksis WHERE id = ?', [id]);
    return rows[0];
};


const generateTransactionCode = async (prefix = 'IN') => {
    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);

    const dateCode = `${year}${month}${day}`; // e.g., 250716
    const baseCode = `${prefix}-${dateCode}`; // e.g., IN-250716

    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM transaksis WHERE transaction_code LIKE ?`,
        [`${baseCode}-%`]
    );

    const urutan = countResult[0].total + 1;
    const formattedUrutan = String(urutan).padStart(4, '0'); // e.g., 0001

    return `${baseCode}-${formattedUrutan}`;
};

const deleteIncome = async (transaksiId) => {
    try {
        // 1. Hapus dari produk_transaksi
        await db.query(
            'DELETE FROM produk_transaksi WHERE transaksi_id = ?',
            [transaksiId]
        );

        // 2. Hapus dari transaksis
        await db.query(
            'DELETE FROM transaksis WHERE id = ?',
            [transaksiId]
        );

        console.log(`Data transaksi dengan ID ${transaksiId} berhasil dihapus`);
        return true;
    } catch (error) {
        console.error('Gagal menghapus transaksi:', error);
        throw error;
    }
};



module.exports = { getAllIncomes, createIncome, updateIncome, deleteIncome };
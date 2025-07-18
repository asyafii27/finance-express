const { StatusCodes } = require('http-status-codes');
const { getAllIncomes, createIncome, updateIncome, deleteIncome } = require('../../services/mysql/incomes');
const Logger = require('../../helpers/winston');
const { successResponse, errorResponse } = require('../../helpers/generalHelper');
const { json } = require('sequelize');
const db = require('../../../db2');


const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.transaction_code) filters.transaction_code = req.query.transaction_code;
        if (req.query.date_start) filters.date_start = req.query.date_start;
        if (req.query.date_end) filters.date_end = req.query.date_end;

        const results = await getAllIncomes(page, limit, filters);

        return successResponse(res, StatusCodes.OK, 'success', results, true);

    } catch (error) {
        Logger.error(`Error when get data incomes: ${error.message}`);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'error');
    }
}

const store = async (req, res) => {
    try {
        const data = req.body;
        if (!data.tanggal) {
            throw new Error('Tanggal wajib diisi');
        }
        if (!data.company_id) {
            throw new Error('Company wajib diisi');
        }
        if (!data.rekening_id) {
            throw new Error('Rekening wajib diisi');
        }
        if (!data.divisi_id) {
            throw new Error('Divisi wajib diisi');
        }
        if (!data.category_id) {
            throw new Error('Kategori wajib diisi');
        }
        if (!data.produk || typeof data.produk !== 'object') {
            throw new Error('Produk wajib diisi');
        }
        if (
            data.produk.produk_id === undefined ||
            isNaN(Number(data.produk.produk_id)) ||
            !Number.isInteger(Number(data.produk.produk_id))
        ) {
            throw new Error('Produk harus berupa angka');
        }
        if (
            data.produk.nominal === undefined ||
            isNaN(Number(data.produk.nominal))
        ) {
            throw new Error('Nominal produk harus berupa angka');
        }
        if (
            data.produk.nominal_discount !== undefined &&
            data.produk.nominal_discount !== null &&
            isNaN(Number(data.produk.nominal_discount))
        ) {
            throw new Error('Nominal discount harus berupa angka');
        }

        user = req.user;
        const result = await createIncome(data, user);

        return res.status(StatusCodes.CREATED).json({
            status: '201',
            message: 'success',
            data: result
        });
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: '400',
            message: error.message
        });
    }
};

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        if (!data.tanggal) throw new Error('Tanggal wajib diisi');
        if (!data.company_id) throw new Error('Company wajib diisi');
        if (!data.rekening_id) throw new Error('Rekening wajib diisi');
        if (!data.divisi_id) throw new Error('Divisi wajib diisi');
        if (!data.category_id) throw new Error('Kategori wajib diisi');
        if (!data.produk || typeof data.produk !== 'object') throw new Error('Produk wajib diisi');

        if (!Number.isInteger(Number(data.produk.produk_id))) {
            throw new Error('Produk harus berupa angka');
        }
        if (isNaN(Number(data.produk.nominal))) {
            throw new Error('Nominal produk harus berupa angka');
        }
        if (
            data.produk.nominal_discount !== undefined &&
            data.produk.nominal_discount !== null &&
            isNaN(Number(data.produk.nominal_discount))
        ) {
            throw new Error('Nominal discount harus berupa angka');
        }

        const result = await updateIncome(id, data, req.user);

        return res.status(200).json({
            status: '200',
            message: 'Update success',
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            status: '400',
            message: error.message
        });
    }
};

const destroy = async (req, res) => {
    try {
        const transaksiId = req.params.id;

        const [rows] = await db.query('SELECT * FROM transaksis WHERE id = ?', [transaksiId]);
        if (rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Data transaksi tidak ditemukan' });
        }

        await deleteIncome(transaksiId);

        return res.status(StatusCodes.OK).json({ message: 'Data transaksi berhasil dihapus' });

    } catch (error) {
        console.error('Error deleteIncome:', error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Terjadi kesalahan saat menghapus data' });
    }
};


module.exports = { index, store, update, destroy };
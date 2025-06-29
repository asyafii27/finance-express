const { StatusCodes } = require('http-status-codes');
const { getAllCompanies, createCompany, updateCompany, deleteCompany } = require('../../services/mysql/companies');
const paginate = require('../../../app/helpers/paginate');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {}

        if (req.query.nama) filters.nama = req.query.nama;

        const results = await getAllCompanies(page, limit, filters);

        if (results.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'No companies found',
            });
        }

        return res.status(StatusCodes.OK).json({
            status: '200',
            message: 'Success',
            data: results.data,
            meta: {
                total: results.total,
                page,
                limit,
                totalPages: Math.ceil(results.total / limit),
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error retrieving companies',
            error: error.message,
        });
    }
}

const store = async (req, res) => {
    try {

        const { nama, code } = req.body;

        if (!nama) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Nama is required'
            });
        }

        if (!code) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Code is required'
            });
        }
        const result = await createCompany({ nama, code })

        return res.status(StatusCodes.CREATED).json({
            status: '201',
            message: 'success',
            data: result
        })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: '422',
            message: 'Error creating company',
            error: err.message,
        })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, code } = req.body;

        if (!nama) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Nama is required'
            });
        }

        if (!code) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Code is required'
            })
        }

        const result = await updateCompany(id, { nama, code });

        if (result.affectedRows == 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Company not found'
            })
        }

        return res.status(StatusCodes.OK).json({
            status: '200',
            message: 'Company updated successfully',
            data: result
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: '422',
            message: 'Error updating company',
            error: error.message
        })
    }
}

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await deleteCompany(id);
        return res.status(StatusCodes.OK).json({
            status: '200',
            message: 'Company deleted successfully',
            data: result
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: '422',
            message: 'Error deleting company',
            error: error.message
        })
    }
}

module.exports = { index, store, update, destroy }
const { StatusCodes } = require('http-status-codes');
const { getAllTipes } = require('../../services/mysql/tipes');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.nama) filters.nama = req.query.nama;
        if (req.query.code) filters.code = req.query.code;

        const results = await getAllTipes(page, limit, filters);

        if (results.length <= 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: '200',
                message: 'Data not found',
                data: []
            })
        } else {
            return res.status(StatusCodes.OK).json({
                status: '200',
                message: 'success',
                data: results.data,
                meta: {
                    total: results.total,
                    page,
                    limit,
                    totalPages: Math.ceil(results.total / limit),
                }
            })
        }
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error retrieving tipes',
            error: error.message,
        });
    }
}

exports.index = index;
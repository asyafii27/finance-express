const { StatusCodes } = require('http-status-codes');
const { getAllDivisies } = require('../../services/mysql/divisies');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.id) filters.id = req.query.id;
        if (req.query.name) filters.name = req.query.name;

        const results = await getAllDivisies(page, limit, filters);

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
            message: 'Error retrieving divisies',
            error: error.message,
        });
    }
}

module.exports = {
    index
}
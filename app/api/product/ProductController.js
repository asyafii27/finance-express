const { StatusCodes } = require('http-status-codes');
const { getAllProducts } = require('../../services/mysql/products');
const Logger = require('../../helpers/winston');
const { successResponse, errorResponse } = require('../../helpers/generalHelper');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.id) filters.id = req.query.id;
        if (req.query.name) filters.name = req.query.name;
        if (req.query.code) filters.code = req.query.code;
        if (req.query.category_id) filters.category_id = req.query.category_id;
        if (req.query.is_dyanamic_price) filters.is_dyanamic_price = req.query.is_dyanamic_price;
        if (req.query.type) filters.type = req.query.type;

        const results = await getAllProducts(page, limit, filters);

        res = successResponse(res, StatusCodes.OK, 'success', results, true);

        return res;

    } catch (error) {
        Logger.error(`Error when get data products: ${error.message}`);
        return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'error');
    }
}

module.exports = { index };
const { StatusCodes } = require('http-status-codes');
const { getAllRekenings } = require('../../services/mysql/rekenings');
const Logger = require('../../helpers/winston');
const { successResponse, errorResponse } = require('../../helpers/generalHelper');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.id) filters.id = req.query.id;
        if (req.query.is_self_rekening) filters.is_self_rekening = req.query.is_self_rekening;
        if (req.query.company_id) filters.company_id = req.query.company_id;

        const results = await getAllRekenings(page, limit, filters);

        res = successResponse(res, StatusCodes.OK, 'success', results, true);

        return res;

    } catch (error) {
        Logger.error(`Error when get data products: ${error.message}`);
        res = errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'error');
    }
}

module.exports = { index };
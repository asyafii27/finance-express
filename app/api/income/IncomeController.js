const { StatusCodes } = require('http-status-codes');
const { getAllIncomes } = require('../../services/mysql/incomes');
const Logger = require('../../helpers/winston');
const { successResponse, errorResponse } = require('../../helpers/generalHelper');
const { json } = require('sequelize');


const index = async (req, res) => {
    // try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    if (req.query.transaction_code) filters.transaction_code = req.query.transaction_code;
    if (req.query.date_start) filters.date_start = req.query.date_start;
    if (req.query.date_end) filters.date_end = req.query.date_end;

    const results = await getAllIncomes(page, limit, filters);

    return successResponse(res, StatusCodes.OK, 'success', results, true);

    // } catch (error) {
    //     Logger.error(`Error when get data incomes: ${error.message}`);
    //     return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'error');
    // }
}

module.exports = { index };
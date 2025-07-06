const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { getAllCategories } = require('../../services/mysql/categories');
const { successResponse, errorResponse } = require('../../helpers/generalHelper');
const paginate = require('../../helpers/paginate');
const Logger = require('../../helpers/winston');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};

        if (req.query.id) filters.id = req.query.id;
        if (req.query.divisi_id) filters.divisi_id = req.query.divisi_id;
        if (req.query.name) filters.name = req.query.name;
        if (req.query.is_ads_rule) filters.is_ads_rule = req.query.is_ads_rule;
        if (req.query.is_beban_gaji) filters.is_beban_gaji = req.query.is_beban_gaji;

        const results = await getAllCategories(page, limit, filters);

        res = successResponse(res, StatusCodes.OK, 'Success', results, true);

        return res;
    } catch (error) {
        Logger.error(`Error whern get data categories: ${error.message}`);

        res = errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'error');
        return res;
    }
}

module.exports = { index }
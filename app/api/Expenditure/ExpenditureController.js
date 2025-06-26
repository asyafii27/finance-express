const { StatusCodes } = require('http-status-codes');
const { getAllExpenditures, createExpenditure, updateExpenditure, deleteExpenditure } = require('../../services/mysql/expenditure');
const paginate = require('../../helpers/paginate');

const index = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {}

        if (req.query.company_id) filters.company_id = req.query.company_id;

        const results = await getAllExpenditures(page, limit, filters);

        if (results.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'No expenditures found',
            });
        }

        const paginated = paginate(results.data, page, limit);

        return res.status(StatusCodes.OK).json({
            status: '200',
            message: 'Success',
            data: paginated.data,
            meta: paginated.meta,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error retrieving Expenditures',
            error: error.message,
        });
    }
}

const store = async (req, res) => {
    try {
        const data = req.body;
        const result = await createExpenditure(data);

        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateExpenditure(id, data)

        res.status(StatusCodes.OK).json({
            status: '200',
            message: 'sukses',
            data: result
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

const destroy = async (req, res) => {
    try {

        const id = req.params.id;
        result = await deleteExpenditure(id);

        res.status(StatusCodes.OK).json({
            status: '200',
            message: 'sukses',
            data: []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = { index, store, update, destroy }
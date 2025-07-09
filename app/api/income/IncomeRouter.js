const express = require('express');
const router = express.Router();
const { index } = require('./IncomeController');

router.get('/', index);

module.exports = router;
const express = require('express');
const router = express.Router();
const { index } = require('./RekeningController');

router.get('/', index);

module.exports = router;
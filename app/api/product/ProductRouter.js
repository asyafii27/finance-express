const express = require('express');
const router = express.Router();
const { index } = require('./ProductController');

router.get('/', index);

module.exports = router;
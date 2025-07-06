const express = require('express');
const router = express.Router();
const { index } = require('./TipeController');

router.get('/', index);

module.exports = router;
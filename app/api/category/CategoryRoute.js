const express = require('express');
const route = express.Router();
const { index } = require('./CategoryController');

route.get('/', index);

module.exports = route;
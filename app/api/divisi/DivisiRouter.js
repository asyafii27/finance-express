const express = require('express');
const route = express.Router();
const { index } = require('./DivisiController');


route.get('/', index);

module.exports = route;
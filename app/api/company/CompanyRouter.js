const express = require('express');
const router = express.Router();
const { index, store, update, destroy } = require('./CompanyController');

router.get('/', index);
router.post('/create', store);
router.put('/edit/:id', update);
router.delete('/:id', destroy);

module.exports = router;
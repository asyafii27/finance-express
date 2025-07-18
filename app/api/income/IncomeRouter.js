const express = require('express');
const router = express.Router();
const { index, store, update, destroy } = require('./IncomeController');

router.get('/', index);
router.post('/create', store);
router.post('/edit/:id', update);
router.delete('/delete/:id', destroy);

module.exports = router;
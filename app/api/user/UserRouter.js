const express = require('express');
const router = express.Router();
const { register, login, logout } = require('./UserController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
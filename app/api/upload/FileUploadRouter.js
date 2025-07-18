const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'temp/' });

const { uploadFile } = require('./fileUploadController');

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;

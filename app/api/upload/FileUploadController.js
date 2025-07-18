const { StatusCodes } = require('http-status-codes');
const { handleUpload } = require('./HandleUpload');

const uploadFile = async (req, res) => {
    try {
        const folder = req.body.folder;
        const file = req.file;

        if (!folder) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Folder tidak boleh kosong',
            });
        }

        if (!file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'File harus dikirim',
            });
        }

        const result = await handleUpload(folder, file);

        return res.status(StatusCodes.OK).json({
            message: 'Upload berhasil',
            file: result,
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

module.exports = {
    uploadFile,
};

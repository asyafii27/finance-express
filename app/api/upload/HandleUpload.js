const fs = require('fs');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const handleUpload = async (folder, file) => {
    return new Promise((resolve, reject) => {
        try {
            if (!folder || typeof folder !== 'string') {
                return reject({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'Folder tujuan upload tidak valid',
                });
            }

            if (!file) {
                return reject({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'File tidak ditemukan',
                });
            }

            const baseUploadDir = path.join(__dirname, '../../../assets/images');
            const targetDir = path.join(baseUploadDir, folder);

            // Buat folder jika belum ada
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // Nama file baru
            const ext = path.extname(file.originalname);
            const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            const targetPath = path.join(targetDir, filename);

            // Pindahkan file dari tmp ke folder tujuan
            fs.rename(file.path, targetPath, (err) => {
                if (err) {
                    return reject({
                        status: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: 'Gagal menyimpan file',
                    });
                }

                resolve({
                    folder: folder,
                    filename: filename,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    // path: `/uploads/${folder}/${filename}`
                    path: `../../../assets/images/${folder}/${filename}`

                });
            });

        } catch (error) {
            reject({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: error.message || 'Terjadi kesalahan saat upload file'
            });
        }
    });
};

module.exports = {
    handleUpload,
};

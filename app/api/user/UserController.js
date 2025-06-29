const { StatusCodes } = require('http-status-codes');
const { registerUser, loginUser } = require('../../services/mysql/user');


const register = async (req, res) => {
    try {
        const { email, name, password, confirm_password, company_id, role, divisi_id, category_id, produk_id, rekening_id, rekening_destination_id } = req.body;

        if (!email || !name || !password || !confirm_password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Mohon lengkapi semua bidang: email, name, password, dan confirm password.'
            });
        }

        if (password !== confirm_password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Password dan konfirmasi password tidak cocok.'
            });
        }

        if (password.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Password harus memiliki setidaknya 6 karakter.'
            });
        }

        if (company_id && (!Array.isArray(company_id) || company_id.some(id => typeof id !== 'number'))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'company_id harus berupa array angka.'
            });
        }

        if (category_id && (!Array.isArray(category_id) || category_id.some(id => typeof id !== 'number'))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'category_id harus berupa array angka.'
            });
        }

        if (produk_id && (!Array.isArray(produk_id) || produk_id.some(id => typeof id !== 'number'))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'produk_id harus berupa array angka.'
            });
        }

        if (rekening_id && (!Array.isArray(rekening_id) || rekening_id.some(id => typeof id !== 'number'))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'rekening_id harus berupa array angka.'
            });
        }

        if (rekening_destination_id && (!Array.isArray(rekening_destination_id) || rekening_destination_id.some(id => typeof id !== 'number'))) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'rekening_destination_id harus berupa array angka.'
            });
        }

        const newUser = await registerUser({ email, name, password, role, company_id, divisi_id, category_id, produk_id });

        return res.status(StatusCodes.CREATED).json({
            status: 'success',
            message: 'Pendaftaran berhasil!',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        });

    } catch (error) {
        console.error('Error in register controller:', error.message);

        if (error.message.includes('sudah terdaftar')) {
            return res.status(StatusCodes.CONFLICT).json({
                status: 'fail',
                message: error.message
            });
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Terjadi kesalahan internal server.',
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Mohon lengkapi semua bidang: email dan password.'
            });
        }

        const user = await loginUser({ email, password });

        return res.status(StatusCodes.OK).json({
            status: 'success',
            message: 'Login berhasil!',
            data: user
        });
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: 'error',
            message: error.message,
            data: null
        })
    }
}

module.exports = {
    register, login
};
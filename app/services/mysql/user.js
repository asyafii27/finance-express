const db = require('../../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async ({ email, name, password, role, company_id, divisi_id, category_id, produk_id }) => {
    console.log('cek company_id:', company_id);
    return new Promise((resolve, reject) => {
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Error checking existing user in service:', err);
                return reject(new Error('Terjadi kesalahan server saat memeriksa pengguna.'));
            }

            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.email === email) {
                    return reject(new Error('Email sudah terdaftar.'));
                }
            }

            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password in service:', err);
                    return reject(new Error('Terjadi kesalahan server saat mengenkripsi password.'));
                }

                const insertUserQuery = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
                db.query(insertUserQuery, [email, name, hashedPassword], (err, result) => {
                    if (err) {
                        console.error('Error inserting user into database in service:', err);
                        return reject(new Error('Terjadi kesalahan server saat mendaftarkan pengguna.'));
                    }

                    const newUserId = result.insertId;

                    const insertions = [];

                    if (company_id && Array.isArray(company_id) && company_id.length > 0) {
                        const insertCompanyUserQuery = 'INSERT INTO company_user (company_id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
                        const companyUserInserts = company_id.map(compId => {
                            return new Promise((resolveInsert) => {
                                db.query(insertCompanyUserQuery, [compId, newUserId], (err) => {
                                    resolveInsert(!err);
                                });
                            });
                        });
                        insertions.push(Promise.all(companyUserInserts));
                    }

                    if (divisi_id && Array.isArray(divisi_id) && divisi_id.length > 0) {
                        const insertDivisiUserQuery = 'INSERT INTO divisi_user (divisi_id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
                        const divisiUserInserts = divisi_id.map(divId => {
                            return new Promise((resolveInsert) => {
                                db.query(insertDivisiUserQuery, [divId, newUserId], (err) => {
                                    resolveInsert(!err);
                                });
                            });
                        });
                        insertions.push(Promise.all(divisiUserInserts));
                    }

                    if (category_id && Array.isArray(category_id) && category_id.length > 0) {
                        const insertCategoryUserQuery = 'insert into category_user (category_id, user_id, created_at, updated_at) values (?, ?, NOW(), NOW())';
                        const categoryUserInserts = category_id.map(catId => {
                            return new Promise((resolveInsert) => {
                                db.query(insertCategoryUserQuery, [catId, newUserId], (err) => {
                                    resolveInsert(!err);
                                });
                            });
                        });
                        insertions.push(Promise.all(categoryUserInserts));
                    }

                    if (produk_id && Array.isArray(produk_id) && produk_id.length > 0) {
                        const insertProdukUserQuery = 'insert into produk_user (produk_id, user_id, created_at, updated_at) values (?, ?, NOW(), NOW())';
                        const produkUserInserts = produk_id.map(proId => {
                            return new Promise((resolveInsert) => {
                                db.query(insertProdukUserQuery, [proId, newUserId], (err) => {
                                    resolveInsert(!err);
                                });
                            });
                        });
                        insertions.push(Promise.all(produkUserInserts));
                    }

                    Promise.all(insertions).then(([companyStatus = [], divisiStatus = [], categoryStatus = [], produkStatus = []]) => {
                        resolve({
                            id: newUserId,
                            email: email,
                            name: name,
                            company_ids_registered: company_id,
                            divisi_ids_registered: divisi_id,
                            company_user_insert_status: companyStatus,
                            divisi_user_insert_status: divisiStatus,
                            category_user_insert_status: categoryStatus,
                            prosuk_user_insert_status: produkStatus
                        });
                    }).catch(error => {
                        console.error('Error during user-company/divisi/category relation insertions:', error);
                        reject(new Error('Terjadi kesalahan saat mengaitkan pengguna dengan relasi.'));
                    });
                });
            });
        });
    });
};

const loginUser = async ({ email, password }) => {
    return new Promise((resolve, reject) => {
        const getUserQuery = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        db.query(getUserQuery, [email], (err, results) => {
            if (err || results.length === 0) {
                return reject(new Error('Email tidak ditemukan.'));
            }

            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    return reject(new Error('Password salah.'));
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    'RAHASIA_JWT_KAMU',
                    { expiresIn: '1d' }
                );

                resolve({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    token
                });
            });
        });
    });
};

module.exports = {
    registerUser, loginUser
};

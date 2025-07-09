// db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); 

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ega_finance_express',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0 
});

// Tidak perlu pakai getConnection manual, cukup log
console.log('MySQL promise pool initialized.');

module.exports = pool;

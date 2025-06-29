const mysql = require('mysql2');
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

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error getting initial connection from pool:', err.stack);
        return;
    }
    console.log('MySQL connection pool created successfully.');
    connection.release();
});

module.exports = pool;
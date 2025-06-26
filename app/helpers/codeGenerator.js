const dayjs = require('dayjs');
const db = require('../../db');

async function generateTransactionCode(isExpenditure) {
    let prefix, isExpenditureId;
    if (isExpenditure == 1) {
        prefix = "OU";
        isExpenditureId = "1";
    } else if (isExpenditure == 9) {
        prefix = "IN";
        isExpenditureId = "9";
    } else if (isExpenditure == 2) {
        prefix = "DPE";
        isExpenditureId = "2";
    } else {
        prefix = "NONE";
        isExpenditureId = null;
    }

    const date = dayjs().format('DDMMYY');
    const codeToday = `${prefix}-${date}`;

    let maxSuffix = 0;
    if (isExpenditureId) {
        const query = `
            SELECT transaction_code 
            FROM transaksis 
            WHERE transaction_code IS NOT NULL 
                AND is_expenditure = ?
                AND transaction_code LIKE ?
        `;
        const [rows] = await db.promise().query(query, [isExpenditureId, `${prefix}-${date}-%`]);
        if (rows.length) {
            rows.forEach(row => {
                const parts = row.transaction_code.split('-');
                if (parts[2]) {
                    const suffix = parseInt(parts[2], 10);
                    if (!isNaN(suffix) && suffix > maxSuffix) {
                        maxSuffix = suffix;
                    }
                }
            });
        }
    }

    const newTransactionCode = `${codeToday}-${maxSuffix + 1}`;
    return newTransactionCode;
}

module.exports = { generateTransactionCode }
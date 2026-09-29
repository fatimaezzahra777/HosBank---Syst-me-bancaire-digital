const pool = require("../config/database");

async function getAccountsByUserId(userId) {
    const [rows] = await pool.execute(
        `SELECT
            id,
            account_number,
            rib,
            type,
            balance,
            status
         FROM accounts
         WHERE user_id = ?
         ORDER BY id DESC`,
        [userId]
    );

    return rows;
}

async function getAccountById(accountId, userId) {
    const [rows] = await pool.execute(
        `SELECT
            id,
            account_number,
            rib,
            type,
            balance,
            status
         FROM accounts
         WHERE id = ?
         AND user_id = ?`,
        [accountId, userId]
    );

    return rows[0];
}

module.exports = {
    getAccountsByUserId,
    getAccountById
};
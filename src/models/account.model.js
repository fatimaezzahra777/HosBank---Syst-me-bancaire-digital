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


module.exports = {
    getAccountsByUserId
};
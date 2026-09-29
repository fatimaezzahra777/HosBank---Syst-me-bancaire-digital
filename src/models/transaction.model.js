const pool = require("../config/database");

async function getHistoryByUserId(userId) {

    const [rows] = await pool.execute(

        `SELECT
            tr.id,
            tr.type,
            tr.amount,
            tr.description,
            tr.status,
            tr.created_at,
            a.account_number,
            a.type AS account_type

         FROM transactions tr

         INNER JOIN accounts a
            ON a.id = tr.account_id

         WHERE a.user_id = ?

         ORDER BY tr.created_at DESC`,

        [userId]
    );

    return rows;
}


module.exports = {
    getHistoryByUserId
};
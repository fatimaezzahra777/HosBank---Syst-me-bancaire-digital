const pool = require("../config/database");

async function createRequest(
    userId,
    type,
    description = null
) {
    const [result] = await pool.execute(
        `INSERT INTO requests
        (
            user_id,
            type,
            status,
            description
        )
        VALUES (?, ?, 'PENDING', ?)`,
        [
            userId,
            type,
            description
        ]
    );

    return result.insertId;
}

async function getRequestsByUserId(userId) {
    const [rows] = await pool.execute(
        `SELECT
            id,
            type,
            status,
            description,
            created_at,
            updated_at
         FROM requests
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );

    return rows;
}

async function getPendingRequest(
    userId,
    type
) {
    const [rows] = await pool.execute(
        `SELECT id
         FROM requests
         WHERE user_id = ?
         AND type = ?
         AND status = 'PENDING'
         LIMIT 1`,
        [userId, type]
    );

    return rows[0];
}

module.exports = {
    createRequest,
    getRequestsByUserId,
    getPendingRequest
};
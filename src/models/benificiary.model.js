const pool = require("../config/database");

async function getBenificier(userId,) {
    
    const [rows] = await pool.execute(
        `SELECT *
        FROM beneficiaries
        WHERE user_id = ?
        ORDER BY name DESC
        `,
        [userId]
    );
    return rows;
}

async function createBeneficier(userId, name, rib) {
     
    const [result] = await pool.execute(
        `INSERT INTO beneficiaries
        (user_id, name, rib)
        VALUES (?,?,?)`,
        [userId, name, rib]
    );

    return result.insertId;
}

async function deleteBeneficier(id, userId) {
     
    const [result] = await pool.execute(
        `DELETE FROM beneficiaries
         WHERE id = ?
         AND user_id = ?`,
        [id, userId]
    );

    return result.affectedRows;
};

module.exports = {
    getBenificier,
    createBeneficier,
    deleteBeneficier
}
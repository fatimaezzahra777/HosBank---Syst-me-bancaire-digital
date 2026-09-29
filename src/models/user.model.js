const pool = require("../config/database");

async function findUserByEmail(email){
    const [rows] = await pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
}

async function createUser(firstName, lastName, email, password){
    const [result] = await pool.execute(
        `INSERT INTO users
        (first_name, last_name, email,password, role_id)
        VALUES(?,?,?,?,?)`,
        [firstName, lastName, email, password, 1]
    );

    return result.insertId;
}

async function findUserById(Id){
    const [result] = await pool.execute(
        `SELECT * FROM users WHERE id=?`,
        [id]
    );

    return rows[0];
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};
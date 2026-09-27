const pool = require("../config/database");

async function getClientAccounts(userId) {
    const [rows] = await pool.execute(
        `SELECT id, account_number, rib, type, balance, status
         FROM accounts
         WHERE user_id = ?
         AND status = 'ACTIVE'
         ORDER BY id DESC`,
         [userId]
    );

    return rows;
}

async function getClientBeneficiaries(userId) {
    const [rows] = await pool.execute(
        `SELECT id, name, rib, status
         FROM beneficiaries
         WHERE user_id = ?
         AND status = 'ACTIVE'
         ORDER BY name ASC`,
         [userId]
    );

    return rows;
}

async function getAccountForTransfer(userId) {
    const [rows] = await pool.execute(
        `SELECT id, balance
         FROM accounts
         WHERE id = ?
         AND user_id = ?
         AND status = 'ACTIVE'`,
         [accountId, userId]
    );

    return rows[0];
}

async function getBeneficiaryForTransfer(
    beneficiaryId,
    userId
) {

    const [rows] = await pool.execute(
        `SELECT id, name, rib
         FROM beneficiaries
         WHERE id = ?
         AND user_id = ?
         AND status = 'ACTIVE'`,
        [beneficiaryId, userId]
    );

    return rows[0];
}

async function createTransfer(
    accountId,
    beneficiaryId,
    amount,
    description
) {

    const [result] = await pool.execute(
        `INSERT INTO transfers
        (
            account_id,
            beneficiary_id,
            amount,
            status,
            description
        )
        VALUES (?, ?, ?, 'COMPLETED', ?)`,
        [
            accountId,
            beneficiaryId,
            amount,
            description || null
        ]
    );

    return result.insertId;
}


async function updateAccountBalance(
    accountId,
    amount
) {

    await pool.execute(
        `UPDATE accounts
         SET balance = balance - ?
         WHERE id = ?`,
        [amount, accountId]
    );
}


async function createTransaction(
    accountId,
    transferId,
    amount,
    description
) {

    const [result] = await pool.execute(
        `INSERT INTO transactions
        (
            account_id,
            transfer_id,
            type,
            amount,
            description,
            status
        )
        VALUES (?, ?, 'TRANSFER', ?, ?, 'COMPLETED')`,
        [
            accountId,
            transferId,
            amount,
            description || null
        ]
    );

    return result.insertId;
}


module.exports = {
    getClientAccounts,
    getClientBeneficiaries,
    getAccountForTransfer,
    getBeneficiaryForTransfer,
    createTransfer,
    updateAccountBalance,
    createTransaction
};
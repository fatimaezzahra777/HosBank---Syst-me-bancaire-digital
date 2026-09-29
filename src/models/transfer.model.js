const pool = require("../config/database");

async function getAccounts(userId) {

    const [rows] = await pool.execute(
        `SELECT
            id,
            account_number,
            type,
            balance
         FROM accounts
         WHERE user_id = ?
         AND status = 'ACTIVE'
         ORDER BY id DESC`,
        [userId]
    );

    return rows;
}


async function getBeneficiaries(userId) {

    const [rows] = await pool.execute(
        `SELECT
            id,
            name,
            rib
         FROM beneficiaries
         WHERE user_id = ?
         AND status = 'ACTIVE'
         ORDER BY name`,
        [userId]
    );

    return rows;
}


async function getAccount(
    connection,
    accountId,
    userId
) {

    const [rows] = await connection.execute(
        `SELECT id, balance
         FROM accounts
         WHERE id = ?
         AND user_id = ?
         AND status = 'ACTIVE'
         FOR UPDATE`,
        [accountId, userId]
    );

    return rows[0];
}


async function getBeneficiary(
    connection,
    beneficiaryId,
    userId
) {

    const [rows] = await connection.execute(
        `SELECT id, name, rib
         FROM beneficiaries
         WHERE id = ?
         AND user_id = ?
         AND status = 'ACTIVE'`,
        [beneficiaryId, userId]
    );

    return rows[0];
}


async function executeTransfer(
    userId,
    accountId,
    beneficiaryId,
    amount,
    description
) {

    const connection =
        await pool.getConnection();

    try {

        await connection.beginTransaction();


        const account =
            await getAccount(
                connection,
                accountId,
                userId
            );


        if (!account) {
            throw new Error(
                "Compte bancaire invalide."
            );
        }


        if (
            Number(account.balance) <
            Number(amount)
        ) {

            throw new Error(
                "Solde insuffisant."
            );
        }


        const beneficiary =
            await getBeneficiary(
                connection,
                beneficiaryId,
                userId
            );


        if (!beneficiary) {

            throw new Error(
                "Bénéficiaire invalide."
            );
        }


        const [transfer] =
            await connection.execute(

                `INSERT INTO transfers
                (
                    account_id,
                    beneficiary_id,
                    amount,
                    status,
                    description
                )
                VALUES
                (?, ?, ?, 'COMPLETED', ?)`,

                [
                    accountId,
                    beneficiaryId,
                    amount,
                    description || null
                ]
            );


        const transferId =
            transfer.insertId;


        await connection.execute(

            `UPDATE accounts
             SET balance = balance - ?
             WHERE id = ?`,

            [
                amount,
                accountId
            ]
        );


        await connection.execute(

            `INSERT INTO transactions
            (
                account_id,
                transfer_id,
                type,
                amount,
                description,
                status
            )
            VALUES
            (
                ?,
                ?,
                'TRANSFER',
                ?,
                ?,
                'COMPLETED'
            )`,

            [
                accountId,
                transferId,
                amount,
                description || null
            ]
        );


        await connection.commit();


        return transferId;


    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();
    }
}


async function getTransfers(userId) {

    const [rows] = await pool.execute(

        `SELECT
            t.id,
            t.amount,
            t.status,
            t.description,
            t.account_id,
            b.name AS beneficiary_name,
            b.rib AS beneficiary_rib,
            a.account_number
         FROM transfers t

         INNER JOIN accounts a
            ON a.id = t.account_id

         INNER JOIN beneficiaries b
            ON b.id = t.beneficiary_id

         WHERE a.user_id = ?

         ORDER BY t.id DESC`,

        [userId]
    );

    return rows;
}


module.exports = {
    getAccounts,
    getBeneficiaries,
    executeTransfer,
    getTransfers
};
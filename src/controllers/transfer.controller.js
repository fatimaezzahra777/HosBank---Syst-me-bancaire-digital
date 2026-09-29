const transferModel =
    require("../models/transfer.model");


async function showTransfers(req, res) {

    try {

        const userId =
            req.session.user.id;

        const accounts =
            await transferModel.getAccounts(
                userId
            );

        const beneficiaries =
            await transferModel.getBeneficiaries(
                userId
            );

        const transfers =
            await transferModel.getTransfers(
                userId
            );

        res.render("client/transfers", {
            accounts,
            beneficiaries,
            transfers,
            error: null,
            success: null
        });

    } catch (error) {

        console.error(error);

        res.render("client/transfers", {
            accounts: [],
            beneficiaries: [],
            transfers: [],
            error: error.message,
            success: null
        });
    }
}


async function createTransfer(req, res) {

    try {

        const userId =
            req.session.user.id;

        const {
            account_id,
            beneficiary_id,
            amount,
            description
        } = req.body;


        if (
            !account_id ||
            !beneficiary_id ||
            !amount
        ) {

            throw new Error(
                "Tous les champs obligatoires doivent être remplis."
            );
        }


        if (Number(amount) <= 0) {

            throw new Error(
                "Le montant doit être supérieur à 0."
            );
        }


        await transferModel.executeTransfer(

            userId,

            account_id,

            beneficiary_id,

            Number(amount),

            description

        );


        res.redirect(
            "/transfers?success=1"
        );


    } catch (error) {

        console.error(error);

        res.redirect(
            `/transfers?error=${encodeURIComponent(error.message)}`
        );
    }
}


module.exports = {
    showTransfers,
    createTransfer
};
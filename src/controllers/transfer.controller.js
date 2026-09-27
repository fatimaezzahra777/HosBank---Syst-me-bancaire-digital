const service = require("../services/service");

async function showTransfers(req, res) {
    try{
        const userId = req.session.user.id;

        const data =
            await service.getTransferPageData(userId);


        res.render("client/transfers", {

            accounts: data.accounts,

            beneficiaries: data.beneficiaries,

            error: null,

            success: null

        });
    } catch (error){
        console.error(error);


        const data =
            await service.getTransferPageData(
                req.session.user.id
            );


        res.render("client/transfers", {

            accounts: data.accounts,

            beneficiaries: data.beneficiaries,

            error: error.message,

            success: null

        });
    }
}

async function createTransfer(req, res) {

    try {

        const userId = req.session.user.id;


        const {
            account_id,
            beneficiary_id,
            amount,
            description
        } = req.body;


        await service.makeTransfer(

            userId,

            account_id,

            beneficiary_id,

            amount,

            description

        );


        res.redirect(
            "/transfers?success=1"
        );


    } catch (error) {

        console.error(error);


        const data =
            await service.getTransferPageData(
                req.session.user.id
            );


        res.render("client/transfers", {

            accounts: data.accounts,

            beneficiaries: data.beneficiaries,

            error: error.message,

            success: null

        });

    }
}

module.exports = {
    showTransfers,
    createTransfer
};
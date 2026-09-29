const service = require("../services/service");

async function showAccounts(req, res) {

    try {

        const userId = req.session.user.id;

        const accounts =
            await service.getClientAccounts(userId);

        res.render("client/accounts", {
            accounts,
            error: null,
            success: null
        });

    } catch (error) {

        console.error(error);

        res.render("client/accounts", {
            accounts: [],
            error: error.message,
            success: null
        });
    }
}


async function requestRib(req, res) {

    try {

        const userId = req.session.user.id;

        const accountId =
            req.params.id;

        await service.requestRib(
            userId,
            accountId
        );

        res.redirect(
            "/accounts?success=rib"
        );

    } catch (error) {

        console.error(error);

        res.redirect(
            `/accounts?error=${encodeURIComponent(error.message)}`
        );
    }
}


async function requestSavingsAccount(req, res) {

    try {

        const userId = req.session.user.id;

        await service.requestSavingsAccount(
            userId
        );

        res.redirect(
            "/accounts?success=savings"
        );

    } catch (error) {

        console.error(error);

        res.redirect(
            `/accounts?error=${encodeURIComponent(error.message)}`
        );
    }
}


module.exports = {
    showAccounts,
    requestRib,
    requestSavingsAccount
};
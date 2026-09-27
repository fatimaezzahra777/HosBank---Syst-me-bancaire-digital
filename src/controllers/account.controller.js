const service = require("../services/service");


async function showAccounts(req, res) {

    try {

        const userId = req.session.user.id;

        const accounts =
            await service.getClientAccounts(userId);


        res.render("client/accounts", {

            accounts: accounts,

            error: null

        });

    } catch (error) {

        console.error(error);

        res.render("client/accounts", {

            accounts: [],

            error: "Impossible de récupérer vos comptes."

        });

    }
}


module.exports = {
    showAccounts
};
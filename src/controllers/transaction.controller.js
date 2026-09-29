const transactionModel =
    require("../models/transaction.model");


async function showHistory(req, res) {

    try {

        const userId =
            req.session.user.id;

        const transactions =
            await transactionModel.getHistoryByUserId(
                userId
            );

        res.render("client/historique", {
            transactions,
            error: null
        });

    } catch (error) {

        console.error(error);

        res.render("client/historique", {
            transactions: [],
            error: error.message
        });
    }
}


module.exports = {
    showHistory
};
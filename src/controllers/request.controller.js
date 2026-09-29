const service = require("../services/service");

async function showRequests(req, res) {

    try {

        const userId = req.session.user.id;

        const requests =
            await service.getClientRequests(
                userId
            );

        res.render("client/requests", {
            requests
        });

    } catch (error) {

        console.error(error);

        res.render("client/requests", {
            requests: []
        });
    }
}

module.exports = {
    showRequests
};
function dashboard(req, res){
    const user = req.session.user;

    res.render("client/dashboard", {
        user
    });
}

module.exports = {
    dashboard
}
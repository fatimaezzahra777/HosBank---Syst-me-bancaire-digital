const authService = require("../services/service");

function showRegister(req, res){
    res.render("auth/register",{
        error: null
    });
}

function showLogin(req, res){
    res.render("auth/login",{
        error: null
    });
}

async function register(req, res){

    try{
        const{
            first_name,
            last_name,
            email,
            password
        } = req.body;

        if(
            !first_name ||
            !last_name ||
            !email ||
            !password
        ) {
            return res.render("auth/register",{
                error: "Tous les champs sont obligatoires"
            });
        }

        await authService.registerUser(
            first_name,
            last_name,
            email,
            password
        );

        res.redirect("/login");
    } catch (error) {
        console.error(error);

        res.render("auth/register", {
            error: error.message
        });
        
    }
}

async function login(req, res){
    try{
        const{
            email,
            password
        } = req.body;

        if(!email || !password){
            return res.render("auth/login", {
                error: "Email et mot de passe obligatoires"
            });
        }

        const user = await authService.loginUser(
            email,
            password
        );

        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        };

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);

        res.render("auth/login", {
            error: error.message
        });
        
    }
}

function logout(req, res) {

    req.session.destroy((error) => {

        if (error) {
            console.error(error);
            return res.status(500).send("Erreur lors de la déconnexion.");
        }

        res.redirect("/login");
    });
}

module.exports = {
    showRegister,
    showLogin,
    register,
    login,
    logout
};
const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const dashboardController = require("../controllers/dashboard.controller");
const beneficiaryController = require("../controllers/benificiary.controller");
const transferController = require("../controllers/transfer.controller");
const accountController = require("../controllers/account.controller");
const transactionController = require("../controllers/transaction.controller");

const { isAuthenticated } = require("../midllewars/auth");

router.get("/register", authController.showRegister);
router.post("/register", authController.register);
router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error("Erreur lors de la déconnexion :", err);
            return res.status(500).send("Erreur lors de la déconnexion");
        }

        res.redirect("/login");

    });

});

router.get("/dashboard", isAuthenticated, dashboardController.dashboard);

router.get("/beneficiaries", isAuthenticated, beneficiaryController.showBeneficiaries);
router.post("/beneficiaries", isAuthenticated, beneficiaryController.addBeneficier );
router.post("/beneficiaries/:id/delete", isAuthenticated, beneficiaryController.deleteBeneficiers );

router.get("/transfers", isAuthenticated,transferController.showTransfers);
router.post("/transfers", isAuthenticated, transferController.createTransfer);

router.get("/accounts", isAuthenticated, accountController.showAccounts);

router.get("/historique", isAuthenticated, transactionController.showHistory)

module.exports = router;
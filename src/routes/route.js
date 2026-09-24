const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

const dashboardController = require("../controllers/dashboard.controller");

const beneficiaryController = require("../controllers/benificiary.controller");

const { isAuthenticated } = require("../midllewars/auth");

router.get("/register", authController.showRegister);
router.post("/register", authController.register);
router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get("/dashboard", isAuthenticated, dashboardController.dashboard);

router.get("/beneficiaries", isAuthenticated, beneficiaryController.showBeneficiaries);
router.post("/beneficiaries", isAuthenticated, beneficiaryController.addBeneficier );
router.post("/beneficiaries/:id/delete", isAuthenticated, beneficiaryController.deleteBeneficiers );

module.exports = router;
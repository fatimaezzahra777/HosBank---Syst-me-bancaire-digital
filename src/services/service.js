const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const beneficiaryModel = require("../models/benificiary.model");
const transferModel= require("../models/transfer.model");
const accountModel = require("../models/account.model");

async function registerUser(firstName, lastName, email, password) {

    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("Cet email est déjà utilisé.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userModel.createUser(
        firstName,
        lastName,
        email,
        hashedPassword
    );

    return userId;
}


async function loginUser(email, password) {

    const user = await userModel.findUserByEmail(email);

    if (!user) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    if (user.status !== "ACTIVE") {
        throw new Error("Votre compte est désactivé.");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    return user;
}

async function getClientBeneficier(userId) {
    return await beneficiaryModel.getBenificier(
        userId
    );
}

async function addBeneficier(userId, name, rib) {
    if (!userId) {
        throw new Error("Utilisateur non connecté.");
    }

    if (!name) {
        throw new Error("Le nom du bénéficiaire est obligatoire.");
    }

    if (!rib) {
        throw new Error("Le RIB est obligatoire.");
    }

    return await beneficiaryModel.createBeneficier(
        userId,
        name,
        rib
    );
}

async function removeBeneficier(beneficiarieId, userId) {
    const deleted = await beneficiaryModel.deleteBeneficier(
        beneficiarieId,userId
    );

    if(deleted === 0){
        throw new Error(
            "beneficier introuvable"
        )
    }

    return true;
}

async function getTransferPageData(userId) {
    const accounts =
        await transferModel.getClientAccounts(userId);

    const beneficiaries =
        await transferModel.getClientBeneficiaries(userId);

    return {
        accounts,
        beneficiaries
    };
}

async function makeTransfer(
    userId,
    accountId,
    beneficiaryId,
    amount,
    description
) {

    if (!accountId) {
        throw new Error(
            "Veuillez sélectionner un compte."
        );
    }

    if (!beneficiaryId) {
        throw new Error(
            "Veuillez sélectionner un bénéficiaire."
        );
    }

    if (!amount || Number(amount) <= 0) {
        throw new Error(
            "Le montant doit être supérieur à 0."
        );
    }


    amount = Number(amount);


    const account =
        await transferModel.getAccountForTransfer(
            accountId,
            userId
        );

    if (!account) {
        throw new Error(
            "Compte bancaire invalide."
        );
    }


    const beneficiary =
        await transferModel.getBeneficiaryForTransfer(
            beneficiaryId,
            userId
        );

    if (!beneficiary) {
        throw new Error(
            "Bénéficiaire invalide."
        );
    }


    if (Number(account.balance) < amount) {
        throw new Error(
            "Solde insuffisant."
        );
    }


    const transferId =
        await transferModel.createTransfer(
            accountId,
            beneficiaryId,
            amount,
            description
        );


    await transferModel.updateAccountBalance(
        accountId,
        amount
    );


    await transferModel.createTransaction(
        accountId,
        transferId,
        amount,
        description
    );


    return transferId;
}

async function getClientAccounts(userId) {

    return await accountModel.getAccountsByUserId(userId);

}


module.exports = {
    registerUser,
    loginUser,
    getClientBeneficier,
    addBeneficier,
    removeBeneficier,
    getTransferPageData,
    makeTransfer,
    getClientAccounts
};
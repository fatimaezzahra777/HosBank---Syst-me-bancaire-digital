const service = require("../services/service");

async function showBeneficiaries(req, res) {
    try{
        const userId = req.session.user.id;

        const beneficiaries = await service.getClientBeneficier(userId);

        res.render("client/beneficiaries",{
            beneficiaries,
            error: null,
            success: null
        });
    } catch(error){
        console.error(error);

        res.render("client/beneficiaries",{
            beneficiaries: [],
            error: error.message,
            success: null
        });
        
    }
}

async function addBeneficier(req, res) {
    try{
        const userId = req.session.user.id;

        const {
            name, rib
        } = req.body;

        console.log("USER ID :", userId);
        console.log("NAME :", name);
        console.log("RIB :", rib);

        await service.addBeneficier(userId, name, rib);

        res.redirect("/beneficiaries");
    } catch (error){
        console.error(error);

        res.render("client/beneficiaries",{
            beneficiaries: [],
            error: error.message,
            success: null
        });  
    }
}

async function deleteBeneficiers(req, res) {
    try {
        const userId = req.session.user.id;

        const beneficiareId = req.params.id; 

        await service.removeBeneficier(beneficiareId, userId);

        res.redirect("/beneficiaries");
    } catch(error){
        console.error(error);

        res.redirect("/beneficiaries");
        
    }
}

module.exports = {
    showBeneficiaries,
    addBeneficier,
    deleteBeneficiers
}
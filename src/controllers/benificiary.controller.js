const service = require("../services/service");

async function showBeneficiaries(req, res) {
    try{
        const clientId = req.session.user.id;

        const beneficiaries = await service.getClientBeneficier(clientId);

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
        const clientId = req.session.user.id;

        const {
            name, rib, bank_name
        } = req.body;

        await service.addBeneficier(clientId, name, rib, bank_name);

        res.redirect("/beneficiaries");
    } catch (error){
        console.error(error);

        res.render("/client/beneficiaries",{
            beneficiaries: [],
            error: error.message,
            success: null
        });  
    }
}

async function deleteBeneficiers(req, res) {
    try {
        const clientId = req.session.user.id;

        const beneficiareId = req.params.id; 

        await service.removeBeneficier(beneficiareId, clientId);

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
const { network } = require("hardhat")
const {deploymentsChains} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts , deployments}) => {
    if(deploymentsChains.includes(network.name)) {
        const {firstAccount} = await getNamedAccounts()
        const {deploy , log} = deployments
        
        log("Deploying ccipsimulator contract")
        await deploy("CCIPLocalSimulator" , {
            contract: "CCIPLocalSimulator",
            from: firstAccount,
            log: true,
            args: []
        })

        log("ccipsimulator contract deployed successfully")
    }
}

module.exports.tags = ["test" , "all"]
module.exports = async({getNamedAccounts , deployments}) => {
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

module.exports.tags = ["test" , "all"]
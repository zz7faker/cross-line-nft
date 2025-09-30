const { network } = require("hardhat")
const {developmentsChains, networkConfig} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts , deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy , log} = deployments
    
    let destChainRouter
    let linkTokenAddr

    if(developmentsChains.includes(network.name)) {
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator" , ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration()
        destChainRouter = ccipConfig.destinationRouter_
        linkTokenAddr = ccipConfig.linkToken_
    } else {
        destChainRouter = networkConfig[network.config.chainId].router
        linkTokenAddr = networkConfig[network.config.chainId].linkToken 
    }
    
    const wnftDeployment = await deployments.get("WrappedMyToken")
    const wnftAddr = wnftDeployment.address

    log("Deploying nftpoolburnandmint contract")
    await deploy("NFTPoolBurnAndMint" , {
        contract: "NFTPoolBurnAndMint",
        from: firstAccount,
        log: true,
        args: [destChainRouter, linkTokenAddr, wnftAddr]
    })

    log("nftpoolburnandmint contract deployed successfully")
}
 
module.exports.tags = ["destchain" , "all"]
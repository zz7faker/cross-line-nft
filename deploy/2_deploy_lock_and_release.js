const { network } = require("hardhat")
const {developmentsChains, networkConfig} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts , deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy , log} = deployments

    let sourceChainRouter
    let linkTokenAddr

    if(developmentsChains.includes(network.name)) {
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator" , ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration()
        sourceChainRouter = ccipConfig.sourceRouter_
        linkTokenAddr = ccipConfig.linkToken_
    } else {
        sourceChainRouter = networkConfig[network.config.chainId].router
        linkTokenAddr =  networkConfig[network.config.chainId].linkToken
    }

    const nftDeployment = await deployments.get("MyToken")
    const nftAddr = nftDeployment.address

    log("Deploying nftpoollockandrelease contract")
    await deploy("NFTPoolLockAndRelease" , {
        contract: "NFTPoolLockAndRelease",
        from: firstAccount,
        log: true,
        args: [sourceChainRouter, linkTokenAddr, nftAddr]
    })

    log("nftpoollockandrelease contract deployed successfully")
}

module.exports.tags = ["sourcechain" , "all"]
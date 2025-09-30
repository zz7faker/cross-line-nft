const {task} = require("hardhat/config")
const {networkConfig} = require("../helper-hardhat-config")

task("burn-and-cross")
    .addOptionalParam("chainselector","chain selector of dest chain")
    .addOptionalParam("receiver", "receiver address on dest chain")
    .addParam("tokenid", "token ID to be crossed chain")
    .setAction(async(taskArgs , hre) => {
        let chainselector
        let receiver
        const tokenId = taskArgs.tokenid
        const {firstAccount} = await getNamedAccounts()

        if(taskArgs.chainselector) {
            chainselector = taskArgs.chainselector
        } else {
            chainselector = networkConfig[network.config.chainId].companionChainSelector
            console.log("chainselector is not in command")
        }

        console.log(`chainSelector is: ${chainselector}`)

        if(taskArgs.receiver) {
            receiver  =taskArgs.receiver
        } else {
            //当前环境下去找对应dest网络下的合约地址
            const nftPoolBurnAndMintDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease")
            receiver = nftPoolBurnAndMintDeployment.address
            console.log("receiver is not in command")
        }

        console.log(`receiver address is: ${receiver}`)
        
        // //transfer link to pool
        // const linkTokenAddress = networkConfig[network.config.chainId].linkToken
        // const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress)
        const nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", firstAccount)
        // const transferTx = await linkToken.transfer(nftPoolBurnAndMint.target, ethers.parseEther("10"))
        // await transferTx.wait(6)
        // const balance = await linkToken.balanceOf(nftPoolBurnAndMint.target)
        
        // console.log(`balance of the pool is: ${balance}`)

        // //approve pool address to call transferFrom
        // const wnft = await ethers.getContract("WrappedMyToken", firstAccount)
        // await wnft.approve(nftPoolBurnAndMint.target, tokenId)
        // console.log("approve successfully")

        //call burnAndSendNFT
        const burnAndSendNFTTx = await nftPoolBurnAndMint.burnAndSendNFT(tokenId, firstAccount, chainselector, receiver, { gasLimit: 500000 })

        console.log(`ccip transaction is sent, the tx hash is ${burnAndSendNFTTx.hash}`)
    }) 

module.exports = {}
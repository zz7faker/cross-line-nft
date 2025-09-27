const { getNamedAccounts, deployments, ethers } = require("hardhat")
const {expect} = require("chai")

let firstAccount
let ccipSimulator
let nft
let wnft
let nftPoolLockAndRelease
let nftPoolBurnAndMint
let chainSelector

before(async function () {
    firstAccount = (await getNamedAccounts()).firstAccount
    await deployments.fixture(["all"])
    ccipSimulator = await ethers.getContract("CCIPLocalSimulator", firstAccount)
    nft = await ethers.getContract("MyToken", firstAccount)
    nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", firstAccount)
    wnft = await ethers.getContract("WrappedMyToken", firstAccount)
    nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", firstAccount)
    const config = await ccipSimulator.configuration()
    chainSelector = config.chainSelector_
})

//source chain -> dest chain
describe("source chain -> dest chain", async function() {
    it("test if user can mint a nft from nft contract", 
        async function() {
            await nft.safeMint(firstAccount)
            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(firstAccount)
        }
    )

    it("test if user can lock the nft and send message to source chain", 
        async function() {
            await nft.approve(nftPoolLockAndRelease.target, 0)
            await ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"))
            // uint256 tokenId, address newOwner, uint64 chainSelector, address recevier
            await nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, nftPoolBurnAndMint.target)

            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(nftPoolLockAndRelease)
        }
    ) 

    it("test if user can get a wnft in dest chain",
        async function() {
            const owner = await wnft.ownerOf(0)
            expect(owner).to.equal(firstAccount)
        }
    ) 
})

// dest chain -> source chain
describe("dest chain -> source chain", async function() {
    it("if user can burn wnft and send message to pool",
        async function() {
            await wnft.approve(nftPoolBurnAndMint.target, 0)
            await ccipSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("10"))
            //uint256 tokenId, address newOwner, uint64 chainSelector, address recevier
            await nftPoolBurnAndMint.burnAndSendNFT(0, firstAccount, chainSelector, nftPoolLockAndRelease.target)

            //wnft == 0 in place of burn successfully
            const totalSupply = await wnft.totalSupply()
            expect(totalSupply).to.equal(0)
        }
    )

    it("if the nft unlocked on the source chain" , 
        async function() {
            const owner = await nft.ownerOf(0)
            expect(owner).to.equal(firstAccount)
        }
    )
})
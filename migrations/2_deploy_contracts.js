const QuestionFactory = artifacts.require("QuestionFactory");
const contractB = artifacts.require("contractB");
const ETLToken = artifacts.require("./ETLToken.sol");
const ETLTokenSale = artifacts.require("./ETLTokenSale.sol");
const ETLNFT = artifacts.require("./ETLNFT.sol");


module.exports = function(deployer) {
  deployer.deploy(QuestionFactory, {overwrite: false});
  deployer.deploy(contractB, {overwrite: false}); 
  deployer.deploy(ETLNFT, "Etherlearn NFT", "ETLNFT", "ipfs://QmRZ7H2Hr3kZELzqK1pPfyjYsBChx1yLmFAiuW2moejpwt/", {overwrite: false});
  
  deployer.deploy(ETLToken, 1000000000, {overwrite: false}).then(function() { 
      // Token price is 0.0001 Ether
      var tokenPrice = 100000000000000; 
      return deployer.deploy(ETLTokenSale, ETLToken.address, tokenPrice, {overwrite: false});  
    }).then(function() {
      var tokensAvailable = 750000;
      ETLToken.deployed().then(function(instance) { instance.transfer(ETLTokenSale.address, tokensAvailable, { from: "0xd2BF5D1B3ceCE53eE825760E6644c1d4E1028C04" }); })
    }).then(function(){
      ETLToken.deployed().then(function(instance) { instance.transfer(ETLToken.address, 999250000, { from: "0xd2BF5D1B3ceCE53eE825760E6644c1d4E1028C04" }); })
    })

  
};

//0xD68bbF06B2E49F82baC9aEA263Eb062212868A2e
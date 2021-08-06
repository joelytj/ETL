const QuestionFactory = artifacts.require("QuestionFactory");
const contractB = artifacts.require("contractB");
const ETLToken = artifacts.require("./ETLToken.sol");
const ETLTokenSale = artifacts.require("./ETLTokenSale.sol");


module.exports = function(deployer) {
  deployer.deploy(QuestionFactory);
  deployer.deploy(contractB); 
  
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


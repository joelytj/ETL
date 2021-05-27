const QuestionFactory = artifacts.require("QuestionFactory");
var ETLToken = artifacts.require("./ETLToken.sol");
var ETLTokenSale = artifacts.require("./ETLTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(QuestionFactory);
  deployer.deploy(ETLToken, 1000000000).then(function() {
      // Token price is 0.001 Ether
      var tokenPrice = 1000000000000000;
      return deployer.deploy(ETLTokenSale, ETLToken.address, tokenPrice);
    }).then(function() {
      var tokensAvailable = 750000;
      ETLToken.deployed().then(function(instance) { instance.transfer(ETLTokenSale.address, tokensAvailable, { from: "0x007D05c187A01ca9c251AF3D2DDeC6369397290b" }); })
    });

};

//replace address with ganache[0] account address
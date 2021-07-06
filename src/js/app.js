App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 100000000000000000, 
    tokensSold: 0,
    tokensAvailable: 100000000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    // initWeb3: function() {
    //   if (typeof web3 !== 'undefined') {
    //     // If a web3 instance is already provided by Meta Mask.
    //     App.web3Provider = web3.currentProvider;
    //     web3 = new Web3(web3.currentProvider);
    //   } else {
    //     // Specify default instance if no web3 instance provided
    //     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //     web3 = new Web3(App.web3Provider);
    //   }
    //   return App.initContracts();
    // },

    initWeb3: function() {

			// Is there is an injected web3 instance?
			if (typeof web3 !== 'undefined') {
        ethereum.enable().then(() => {
          web3 = new Web3(web3.currentProvider);
			  });
			} else {
			  // If no injected web3 instance is detected, fallback to the TestRPC
			  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));			
			}
			App.web3Provider = web3.currentProvider;
			return App.initContracts();

		},

    initContracts: function() {
      $.getJSON("ETLTokenSale.json", function(ETLTokenSale) {
        App.contracts.ETLTokenSale = TruffleContract(ETLTokenSale);
        App.contracts.ETLTokenSale.setProvider(App.web3Provider);
        App.contracts.ETLTokenSale.deployed().then(function(ETLTokenSale) {
          console.log("EtherLearn Token Sale Address:", ETLTokenSale.address);
        });
      }).done(function() {
        $.getJSON("ETLToken.json", function(ETLToken) {
          App.contracts.ETLToken = TruffleContract(ETLToken);
          App.contracts.ETLToken.setProvider(App.web3Provider);
          App.contracts.ETLToken.deployed().then(function(ETLToken) {
            console.log("ETL Token Address:", ETLToken.address);
          });
  
          App.listenForEvents();
          return App.render();
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.ETLTokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#accountAddress').html("Your Account: " + account);
        }
      })
  
      // Load token sale contract
      App.contracts.ETLTokenSale.deployed().then(function(instance) {
        ETLTokenSaleInstance = instance;
        return ETLTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return ETLTokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.ETLToken.deployed().then(function(instance) {
          ETLTokenInstance = instance;
          return ETLTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.etl-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.ETLTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });

// EtherLearn Token Sale Address: – "0xB57749EAd9A959190479464aA5250C69da3Ce5e5"
// ETL Token address: 0xB57749EAd9A959190479464aA5250C69da3Ce5e5
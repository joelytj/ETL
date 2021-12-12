const { projectId, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*", // Match any network id
            gas: 5000000
        },
        rinkeby: {
            provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${projectId}`),
            network_id: 4,       // Rinkeby's id
            gas: 5500000,        // Rinkeby has a lower block limit than mainnet
            confirmations: 2,    // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
        },
        ropsten: {
            provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${projectId}`),
            network_id: 3,       
            gas: 5500000,
            confirmations: 2,    
            timeoutBlocks: 200,  
            skipDryRun: true     
        },
    },
    compilers: {
        solc: {
            version: "^0.5.0",
            settings: {
            optimizer: {
                enabled: true, // Default: false
                runs: 200      // Default: 200
            },
            }
        }
    }
};

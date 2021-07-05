const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/QuestionFactory.json');

const provider = new HDWalletProvider(
    'coconut glass harbor gloom spawn slim crunch assault risk absurd hero unlock',
    'http://localhost:7545'//'https://ropsten.infura.io/v3/d928a9c204db4d418b536b7dbcf89977'
);
//'https://ropsten.infura.io/v3/d928a9c204db4d418b536b7dbcf89977'

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: '0x' + compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '6500000', gasPrice: web3.utils.toWei('15', 'gwei') });

    console.log('Contract deployed to ', result.options.address);
};
deploy();
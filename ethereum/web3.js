import Web3 from 'web3';

let web3;

if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
    //getting Permission to access. This is for when the user has new MetaMask
    window.ethereum.enable();
    web3 = new Web3(window.ethereum);
} else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
    // Acccounts always exposed. This is those who have old version of MetaMask
} else {
    // Specify default instance if no web3 instance provided
    web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/6d97a6def9aa41969baaff23f9d16c9b'));
    // web3 = new Web3(new Web3.providers.HttpProvider('https://localhost:7545'));

}
export default web3;

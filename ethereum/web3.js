import Web3 from 'web3';

//assume user has metamask
// const web3 = new Web3(window.web3.currentProvider); // cannot do with next because cannot see "window" from server

let web3;

// if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
//     //We are in the browser and metamask is running
//     web3 = new Web3(window.web3.currentProvider);
// }else {
//     //We are on the server OR the user is not running metamask
//     const provider = new Web3.providers.HttpProvider(
//         // 'https://ropsten.infura.io/v3/d928a9c204db4d418b536b7dbcf89977'
//         "http://127.0.0.1:7545"
//     );
//     web3 = new Web3(provider);
// }

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

//'https://ropsten.infura.io/v3/6d97a6def9aa41969baaff23f9d16c9b'
//'http://localhost:7545'


//from app.js
// initWeb3: function() {
//     if (typeof web3 !== 'undefined') {
//       // If a web3 instance is already provided by Meta Mask.
//       App.web3Provider = web3.currentProvider;
//       web3 = new Web3(web3.currentProvider);
//     } else {
//       // Specify default instance if no web3 instance provided
//       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//       web3 = new Web3(App.web3Provider);
//     }
import web3 from './web3';

import QuestionFactory from '../build/contracts/QuestionFactory.json';

const instance = new web3.eth.Contract(
    QuestionFactory.abi,
    '0x4f2B32df0b06BF1e9273d680618D1Ee3098706Ff' //0xe83fF915671c634b4381eAED862334F404A939A6
);

export default instance;

// ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
// ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3

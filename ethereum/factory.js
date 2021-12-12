import web3 from './web3';

import QuestionFactory from '../build/contracts/QuestionFactory.json';

const instance = new web3.eth.Contract(
    QuestionFactory.abi,
    '0x0dD5930E89Aa520D74F40014B52A7Ec92f5C791d' //'0x87268FB474aA7b31975BFdA21326383e15527Ed2','0xe83fF915671c634b4381eAED862334F404A939A6'
);

export default instance;

// ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
// ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3

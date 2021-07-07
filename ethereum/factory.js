import web3 from './web3';

import QuestionFactory from '../build/contracts/QuestionFactory.json';

const instance = new web3.eth.Contract(
    QuestionFactory.abi,
    '0x5ec49e7f6fC4fde8DD014A05540297cA6357C4CA'
);

export default instance;

// ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
// ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3

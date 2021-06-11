// import web3 from './web3';

// import QuestionFactory from './build/QuestionFactory.json';

// const instance = new web3.eth.Contract(
//     JSON.parse(QuestionFactory.interface),
//     '0x5D532F096C11ECB736472d28c85fea4643d64544' //0x470A0c87E49b63d417dE4E27e558CE1319C696Bf
// );

// export default instance;

import web3 from './web3';

import QuestionFactory from '../build/contracts/QuestionFactory.json';

const instance = new web3.eth.Contract(
    QuestionFactory.abi,
    // '0x46E7bd94dA1C7040198DcDc8606ad31356faD3Af'
    '0x51dEe8b87Aef81Cfb1Ec6702783479Ec2dE19d8A'
);

export default instance;


// ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
// ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3
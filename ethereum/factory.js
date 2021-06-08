import web3 from './web3';

import QuestionFactory from './build/QuestionFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(QuestionFactory.interface),
    '0x0b306f9Bd53D26e0aa651dcFCA4cF1620E94E354'
);

export default instance;

// import web3 from './web3';

// import QuestionFactory from '../build/contracts/QuestionFactory.json';

// const instance = new web3.eth.Contract(
//     QuestionFactory.abi,
//     // '0x46E7bd94dA1C7040198DcDc8606ad31356faD3Af'
//     '0x1266726958aeca2C1171415E5171ee8cAFe287b7'
// );

// export default instance;


//ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
//ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3
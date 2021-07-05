import web3 from './web3';
import ETLToken from '../build/contracts/ETLToken.json';

export default (address) => {
    return new web3.eth.Contract(
        ETLToken.abi,
        address
    );
};

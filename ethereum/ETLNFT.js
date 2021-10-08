import web3 from './web3';
import ETLNFT from '../build/contracts/ETLNFT.json';

export default (address) => {
    return new web3.eth.Contract(
        ETLNFT.abi,
        address
    );
};

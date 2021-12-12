import web3 from './web3';
import EtherlearnNFT from '../build/contracts/EtherlearnNFT.json';

export default (address) => {
    return new web3.eth.Contract(
        EtherlearnNFT.abi,
        address
    );
};

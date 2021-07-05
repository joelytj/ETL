import web3 from './web3';
import Question from '../build/contracts/Question.json';

export default (address) => {
    return new web3.eth.Contract(
        Question.abi,
        address
    );
};
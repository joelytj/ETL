// import web3 from './web3';
// import Profile from './build/Profile.json';

// export default (address) => {
//     return new web3.eth.Contract(
//         JSON.parse(Profile.interface),
//         address
//     );
// };
import web3 from './web3';
import Profile from '../build/contracts/Profile.json';

export default (address) => {
    return new web3.eth.Contract(
        Profile.abi,
        address
    );
};
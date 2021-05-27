pragma solidity ^0.4.25;

contract ETLToken {
    string  public name = "ETLToken";
    string  public symbol = "ETL";
    string  public standard = "ETL Token v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function ETLToken(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        Transfer(_from, _to, _value);

        return true;
    }
}


// pragma solidity ^0.4.25;

// import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


// contract SimpleToken is ERC20 {

//     string public name = "EtherLearn";
//     string public symbol = "ETL";
//     uint8 public decimals = 2;
//     uint public INITIAL_SUPPLY = 1000000000;
//     constructor() public {
//         _mint(msg.sender, INITIAL_SUPPLY);
//     }
    
// }




//ropsten ETL token contract address: 0x5610c9a3Cb2DC630E1Df961ADe338617FCF3BB77
//ropsten question.sol contract address: 0xf3BD5d0d73AFC1a6d2dEd09f722DF54B5AA75Df3


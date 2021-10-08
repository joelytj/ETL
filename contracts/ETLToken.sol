pragma solidity ^0.8.0;
import './Question.sol';

contract ETLToken {
    string  public name = "ETLToken";
    string  public symbol = "ETL";
    string  public standard = "ETL Token v1.0";
    uint256 public totalSupply;
    uint256 public decimals = 2;

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

    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _user, address _spender, uint256 _value) public returns (bool success) {
        allowance[_user][_spender] = _value;

        emit Approval(_user, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][_to]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][_to] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
    
    // function balanceOf(address _account) public view returns (uint256) {
    //     return balanceOf[_account];
    // }


}

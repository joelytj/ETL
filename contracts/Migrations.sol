pragma solidity ^0.8.0;
contract Migrations {
  address public owner = msg.sender;
  uint256 public last_completed_migration;

  // modifier restricted() {
  //   if (msg.sender == owner) _;
  // }

  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  // constructor() public {
  //   owner = msg.sender;
  // }
  // function Migrations() public {
  //   owner = msg.sender;
  // }
  
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  // function upgrade(address new_address) public restricted {
  //   Migrations upgraded = Migrations(new_address);
  //   upgraded.setCompleted(last_completed_migration);
  // }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintingContract is ERC20, AccessControl	{

    address certificateAddress;

    //0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
    bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    //0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    //0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848
    //bytes32 private constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20("Carb_Token", "CRB") {
        // Grant the default admin role to a specified iocarb account 
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    event Minted(address to, uint256 amount);

    event MinterRoleSet(address minter);

    function setMinter(address _minter) public onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, _minter);
        emit MinterRoleSet(_minter);
    }

    function mint(address _to, uint256 _amount) public onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
        emit Minted(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public {
        require(msg.sender == _from, "Caller is not owner");
        _burn(_from, _amount);
    }

    function buyGreenCertificate() external {
        require(balanceOf(msg.sender) >= 300, "Insufficient balance");
        burn(msg.sender, 300);
        ICertificateContract(certificateAddress).safeMintGreen(msg.sender);
    }

    function buyYellowCertificate() external {
        require(balanceOf(msg.sender) >= 200, "Insufficient balance");
        burn(msg.sender, 200);
        ICertificateContract(certificateAddress).safeMintYellow(msg.sender);
    }

    function buyRedCertificate() external {
        require(balanceOf(msg.sender) >= 100, "Insufficient balance");
        burn(msg.sender, 100);
        ICertificateContract(certificateAddress).safeMintRed(msg.sender);
    }

    function setCertificateAddress(address _certificateAddress) public onlyRole(ADMIN_ROLE) {
        certificateAddress = _certificateAddress;
    }

}

interface ICertificateContract {
    function safeMintGreen(address _to) external;
    function safeMintYellow(address _to) external;
    function safeMintRed(address _to) external;
}
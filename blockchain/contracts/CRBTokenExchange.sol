// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CRBTokenExchange is ReentrancyGuard {
    IERC20 public crbToken;
    
    struct Offer {
        address maker;
        uint256 crbAmount;
        uint256 iotxAmount;
        bool isBuyOffer;
    }
    
    Offer[] public offers;
    
    event OfferCreated(uint256 indexed offerId, address indexed maker, uint256 crbAmount, uint256 iotxAmount, bool isBuyOffer);
    event OfferAccepted(uint256 indexed offerId, address indexed taker);
    event OfferCancelled(uint256 indexed offerId);
    
    constructor(address _crbTokenAddress) {
        crbToken = IERC20(_crbTokenAddress);
    }
    
    function createBuyOffer(uint256 _crbAmount) external payable nonReentrant {
        require(msg.value > 0, "IOTX amount must be greater than 0");
        offers.push(Offer({
            maker: msg.sender,
            crbAmount: _crbAmount,
            iotxAmount: msg.value,
            isBuyOffer: true
        }));
        emit OfferCreated(offers.length - 1, msg.sender, _crbAmount, msg.value, true);
    }
    
    function createSellOffer(uint256 _crbAmount, uint256 _iotxAmount) external nonReentrant {
        require(_crbAmount > 0, "CRB amount must be greater than 0");
        require(_iotxAmount > 0, "IOTX amount must be greater than 0");
        require(crbToken.transferFrom(msg.sender, address(this), _crbAmount), "Transfer failed");
        
        offers.push(Offer({
            maker: msg.sender,
            crbAmount: _crbAmount,
            iotxAmount: _iotxAmount,
            isBuyOffer: false
        }));
        emit OfferCreated(offers.length - 1, msg.sender, _crbAmount, _iotxAmount, false);
    }
    
    function acceptOffer(uint256 _offerId) external payable nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.maker != address(0), "Offer does not exist");
        
        if (offer.isBuyOffer) {
            require(crbToken.transferFrom(msg.sender, offer.maker, offer.crbAmount), "Transfer failed");
            payable(msg.sender).transfer(offer.iotxAmount);
        } else {
            require(msg.value == offer.iotxAmount, "Incorrect IOTX amount");
            require(crbToken.transfer(msg.sender, offer.crbAmount), "Transfer failed");
            payable(offer.maker).transfer(msg.value);
        }
        
        emit OfferAccepted(_offerId, msg.sender);
        _removeOffer(_offerId);
    }
    
    function cancelOffer(uint256 _offerId) external nonReentrant {
        Offer storage offer = offers[_offerId];
        require(offer.maker == msg.sender, "Not the offer maker");
        
        if (offer.isBuyOffer) {
            payable(msg.sender).transfer(offer.iotxAmount);
        } else {
            require(crbToken.transfer(msg.sender, offer.crbAmount), "Transfer failed");
        }
        
        emit OfferCancelled(_offerId);
        _removeOffer(_offerId);
    }
    
    function _removeOffer(uint256 _offerId) private {
        offers[_offerId] = offers[offers.length - 1];
        offers.pop();
    }
    
    function getOffersCount() external view returns (uint256) {
        return offers.length;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Bidders {
    address bidder;
    uint256 bidAmount;
    uint256 fid;
}

struct AuctionMeta {
    address caInUse;
    string tokenName;
    uint256 deadline;
    uint256 auctionId;
}

contract LNOBAuction is Ownable {
    IERC20 public erc20;               
    IERC20Permit public tokenPermit;   

    address public highestBidder;
    uint256 public highestBid;

    uint256 public auctionId = 2;

    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(uint256 => Bidders[]) public biddersByAuctionId;
    mapping(uint256 => string) public currencyUsed;
    mapping(uint256 => address) public caInUse;
    mapping(uint256 => mapping(address => bool)) private hasBid;
    mapping(uint256 => uint256) public auctionDeadline;   // <--- NEW: deadline timestamp

    event BidPlaced(address indexed bidder, uint256 amount, uint256 fid);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount, uint256 nextDeadline);

    constructor(address _owner) Ownable(_owner) {}

    function tokenForAuction(address _token, string calldata _tokenName) public onlyOwner {
        currencyUsed[auctionId] = _tokenName;
        caInUse[auctionId] = _token;
        erc20 = IERC20(_token);
        tokenPermit = IERC20Permit(_token);
    }

        /// @notice Returns metadata of the current auction
    function getCurrentAuctionMeta() external view returns (AuctionMeta memory) {
        return AuctionMeta({
            caInUse: caInUse[auctionId],
            tokenName: currencyUsed[auctionId],
            deadline: auctionDeadline[auctionId],
            auctionId: auctionId
        });
    }

    /// @notice Returns metadata of any auction by ID
    /// @param _auctionId The auction ID to fetch metadata for
    function getAuctionMetaById(uint256 _auctionId) external view returns (AuctionMeta memory) {
        return AuctionMeta({
            caInUse: caInUse[_auctionId],
            tokenName: currencyUsed[_auctionId],
            deadline: auctionDeadline[_auctionId],
            auctionId: _auctionId
        });
    }


    /// @notice Place a bid using EIP-2612 permit signature
    function bidWithPermit(
        uint256 amount,
        uint256 fid,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp < auctionDeadline[auctionId], "Auction has ended"); // <--- NEW CHECK
        require(amount > highestBid, "Bid not high enough");

        tokenPermit.permit(msg.sender, address(this), amount, deadline, v, r, s);
        require(erc20.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        if (highestBidder != address(0)) {
            uint256 refundAmount = highestBid;
            address previousBidder = highestBidder;
            highestBid = 0;
            require(erc20.transfer(previousBidder, refundAmount), "Refund failed");
        }

        bids[auctionId][msg.sender] = amount;

        Bidders[] storage bidders = biddersByAuctionId[auctionId];
        if (!hasBid[auctionId][msg.sender]) {
            bidders.push(Bidders({ bidder: msg.sender, bidAmount: amount, fid: fid }));
            hasBid[auctionId][msg.sender] = true;
        } else {
            for (uint256 i = 0; i < bidders.length; i++) {
                if (bidders[i].bidder == msg.sender) {
                    bidders[i].bidAmount = amount;
                    bidders[i].fid = fid;
                    break;
                }
            }
        }

        highestBid = amount;
        highestBidder = msg.sender;

        emit BidPlaced(msg.sender, amount, fid);
    }

    /// @notice Ends the auction, sends winning bid to owner, and starts a new auction with a set duration
    /// @param nextAuctionDurationHours Duration for the next auction in hours
    function endAuction(uint256 nextAuctionDurationHours) external onlyOwner {
        uint256 currentAuctionId = auctionId;

        if (highestBid > 0 && highestBidder != address(0)) {
            require(erc20.transfer(owner(), highestBid), "USDC transfer to owner failed");
            bids[currentAuctionId][highestBidder] = 0;
        }

        // Reset state
        highestBidder = address(0);
        highestBid = 0;

        // Move to next auction
        auctionId = currentAuctionId + 1;

        // Set deadline for next auction
        uint256 nextDeadline = block.timestamp + (nextAuctionDurationHours * 1 hours);
        auctionDeadline[auctionId] = nextDeadline;

        emit AuctionEnded(currentAuctionId, highestBidder, highestBid, nextDeadline);
    }

    function getBidders(uint256 _auctionId) external view returns (Bidders[] memory) {
        return biddersByAuctionId[_auctionId];
    }

    function emergencyRefund() external onlyOwner {
        uint256 balance = erc20.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(erc20.transfer(owner(), balance), "USDC transfer failed");

        highestBidder = address(0);
        highestBid = 0;

        auctionId = auctionId + 1;
    }
}
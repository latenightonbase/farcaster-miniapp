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

contract LNOBAuction is Ownable {
    IERC20 public immutable usdc;          // For transfers
    IERC20Permit public immutable usdcPermit; // For permit signatures

    bool public auctionEnded;
    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) public bids;  // track total bids per address
    mapping(uint256 => Bidders[]) public biddersByAuctionId;
    mapping(uint256 => mapping(address => bool)) private hasBid;  // track if someone is already in bidders[]

    event BidPlaced(address indexed bidder, uint256 amount, uint256 fid);
    event AuctionEnded(address winner, uint256 amount);

    constructor(address _owner) Ownable(_owner) {
        address _usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        usdc = IERC20(_usdc);
        usdcPermit = IERC20Permit(_usdc);
    }

    uint256 public auctionId = 1;

    /// @notice Place a bid using EIP-2612 permit signature
    function bidWithPermit(
        uint256 amount,
        uint256 fid,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(amount > 0, "Amount must be > 0");

        // Permit this contract to spend bidder's tokens
        usdcPermit.permit(msg.sender, address(this), amount, deadline, v, r, s);

        // Pull tokens from bidder
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        // Update bid data
        bids[msg.sender] += amount;

        Bidders[] storage bidders = biddersByAuctionId[auctionId];

        if (!hasBid[auctionId][msg.sender]) {
            bidders.push(Bidders({
                bidder: msg.sender,
                bidAmount: bids[msg.sender],
                fid: fid
            }));
            hasBid[auctionId][msg.sender] = true;
        } else {
            // update their bidAmount inside struct
            for (uint256 i = 0; i < bidders.length; i++) {
                if (bidders[i].bidder == msg.sender) {
                    bidders[i].bidAmount = bids[msg.sender];
                    bidders[i].fid = fid; // optional: overwrite fid on re-bid
                    break;
                }
            }
        }

        // Update highest bid
        if (bids[msg.sender] > highestBid) {
            highestBid = bids[msg.sender];
            highestBidder = msg.sender;
        }

        emit BidPlaced(msg.sender, amount, fid);
    }

    /// @notice Ends the auction, pays owner, refunds others
    function endAuction() external onlyOwner {

        // Transfer highest bid to owner
        if (highestBid > 0 && highestBidder != address(0)) {
            require(usdc.transfer(owner(), highestBid), "USDC transfer to owner failed");
        }

        Bidders[] storage bidders = biddersByAuctionId[auctionId];

        // Refund all other bidders
        for (uint256 i = 0; i < bidders.length; i++) {
            Bidders memory b = bidders[i];
            if (b.bidder != highestBidder && bids[b.bidder] > 0) {
                uint256 refund = bids[b.bidder];
                bids[b.bidder] = 0;
                require(usdc.transfer(b.bidder, refund), "Refund failed");
            }
            // reset their hasBid flag too
            hasBid[auctionId][b.bidder] = false;
        }

        auctionId +=1;


        emit AuctionEnded(highestBidder, highestBid);
        highestBidder = address(0);
        highestBid = 0;
    }

    /// @notice Get list of bidders
    function getBidders(uint256 _auctionId) external view returns (Bidders[] memory) {
        return biddersByAuctionId[_auctionId];
    }
}
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
    IERC20 public immutable usdc;               // For transfers
    IERC20Permit public immutable usdcPermit;   // For permit signatures

    // GLOBAL auction state (reset between auctions)
    address public highestBidder;
    uint256 public highestBid;

    uint256 public auctionId = 1;

    // 👉 Per-auction accounting
    mapping(uint256 => mapping(address => uint256)) public bids;                    // bids[auctionId][user]
    mapping(uint256 => Bidders[]) public biddersByAuctionId;                        // list per auction
    mapping(uint256 => mapping(address => bool)) private hasBid;                    // presence per auction

    event BidPlaced(address indexed bidder, uint256 amount, uint256 fid);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount);

    constructor(address _owner) Ownable(_owner) {
        address _usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        usdc = IERC20(_usdc);
        usdcPermit = IERC20Permit(_usdc);
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
        require(amount > 0, "Amount must be > 0");

        // Permit this contract to spend bidder's tokens
        usdcPermit.permit(msg.sender, address(this), amount, deadline, v, r, s);

        // Pull tokens from bidder
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        // Update bid data (per-auction)
        bids[auctionId][msg.sender] += amount;

        Bidders[] storage bidders = biddersByAuctionId[auctionId];

        if (!hasBid[auctionId][msg.sender]) {
            bidders.push(Bidders({
                bidder: msg.sender,
                bidAmount: bids[auctionId][msg.sender],
                fid: fid
            }));
            hasBid[auctionId][msg.sender] = true;
        } else {
            // update their bidAmount inside struct
            for (uint256 i = 0; i < bidders.length; i++) {
                if (bidders[i].bidder == msg.sender) {
                    bidders[i].bidAmount = bids[auctionId][msg.sender];
                    bidders[i].fid = fid; // optional: overwrite fid on re-bid
                    break;
                }
            }
        }

        // Update highest bid (per current auction)
        if (bids[auctionId][msg.sender] > highestBid) {
            highestBid = bids[auctionId][msg.sender];
            highestBidder = msg.sender;
        }

        emit BidPlaced(msg.sender, amount, fid);
    }

    /// @notice Ends the auction, pays owner, refunds others
    function endAuction() external onlyOwner {
        uint256 currentAuctionId = auctionId;
        Bidders[] storage bidders = biddersByAuctionId[currentAuctionId];

        // Pay owner the highest bid
        if (highestBid > 0 && highestBidder != address(0)) {
            require(usdc.transfer(owner(), highestBid), "USDC transfer to owner failed");
            // reset winner's per-auction bid to zero
            bids[currentAuctionId][highestBidder] = 0;
        }

        // Refund all other bidders
        for (uint256 i = 0; i < bidders.length; i++) {
            Bidders memory b = bidders[i];
            if (b.bidder != highestBidder) {
                uint256 refund = bids[currentAuctionId][b.bidder];
                if (refund > 0) {
                    bids[currentAuctionId][b.bidder] = 0;
                    require(usdc.transfer(b.bidder, refund), "Refund failed");
                }
            }
            // reset their hasBid flag for this auction
            hasBid[currentAuctionId][b.bidder] = false;
        }

        emit AuctionEnded(currentAuctionId, highestBidder, highestBid);

        // Reset global highest for the next auction
        highestBidder = address(0);
        highestBid = 0;

        // Start next auction
        auctionId = currentAuctionId + 1;
    }

    /// @notice Get list of bidders
    function getBidders(uint256 _auctionId) external view returns (Bidders[] memory) {
        return biddersByAuctionId[_auctionId];
    }

                /// @notice Emergency escape hatch - transfers all USDC to owner and resets current auction
    function emergencyRefund() external onlyOwner {
        uint256 currentAuctionId = auctionId;

        // Transfer all USDC from contract to owner
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        require(usdc.transfer(owner(), balance), "USDC transfer failed");

        // Reset global auction state
        highestBidder = address(0);
        highestBid = 0;

        // Start next auction fresh
        auctionId = currentAuctionId + 1;
    }


}

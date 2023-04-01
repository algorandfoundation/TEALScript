/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */

// eslint-disable-next-line import/no-unresolved, import/extensions
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Auction extends Contract {
  highestBidder = new GlobalReference<Address>({ key: 'highestBidder' });

  auctionEnd = new GlobalReference<uint64>({ key: 'auctionEnd' });

  highestBid = new GlobalReference<uint64>({ key: 'highestBid' });

  asaAmt = new GlobalReference<uint64>({ key: 'asaAmt' });

  asa = new GlobalReference<Asset>({ key: 'asa' });

  @createApplication
  create(): void {
    this.auctionEnd.put(0);
    this.highestBid.put(0);
    this.asaAmt.put(0);
    this.asa.put(Asset.zeroIndex);

    // Use zero address rather than an empty string for Account type safety
    this.highestBidder.put(globals.zeroAddress);
  }

  optIntoAsset(asset: Asset): void {
    /// Only allow app creator to opt the app account into a ASA
    assert(this.txn.sender === globals.creatorAddress);

    /// Verify a ASA hasn't already been opted into
    assert(this.asa.get() === Asset.zeroIndex);

    /// Save ASA ID in global state
    this.asa.put(asset);

    /// Submit opt-in transaction: 0 asset transfer to self
    sendAssetTransfer({
      assetReceiver: this.app.address,
      xferAsset: asset,
      assetAmount: 0,
      fee: 0,
    });
  }

  startAuction(startingPrice: uint64, length: uint64, axfer: AssetTransferTxn): void {
    assert(this.txn.sender === globals.creatorAddress);

    /// Ensure the auction hasn't already been started
    assert(this.auctionEnd.get() === 0);

    /// Verify axfer
    assert(axfer.assetReceiver === this.app.address);

    /// Set global state
    this.asaAmt.put(axfer.assetAmount);
    this.auctionEnd.put(globals.latestTimestamp + length);
    this.highestBid.put(startingPrice);
  }

  private pay(receiver: Account, amount: uint64): void {
    sendPayment({
      // TODO: Enable object shorthand notation
      // eslint-disable-next-line object-shorthand
      receiver: receiver,
      // eslint-disable-next-line object-shorthand
      amount: amount,
      fee: 0,
    });
  }

  // eslint-disable-next-line no-unused-vars
  bid(payment: PayTxn, previousBidder: Account): void {
    /// Ensure auction hasn't ended
    assert(globals.latestTimestamp < this.auctionEnd.get());

    /// Verify payment transaction
    assert(payment.amount > this.highestBid.get());
    assert(this.txn.sender === payment.sender);

    /// Return previous bid if there was one
    if (this.highestBidder.get() !== globals.zeroAddress) {
      this.pay(this.highestBidder.get(), this.highestBid.get());
    }

    /// Set global state
    this.highestBid.put(payment.amount);
    this.highestBidder.put(payment.sender);
  }

  claimBid(): void {
    // Auction end check is commented out for automated testing
    // assert(globals.latestTimestamp > this.auctionEnd.get());
    this.pay(globals.creatorAddress, this.highestBid.get());
  }

  claim_asset(asset: Asset, assetCreator: Account): void {
    // Auction end check is commented out for automated testing
    // assert(globals.latestTimestamp > this.auctionEnd.get());
    /// Send ASA to highest bidder
    sendAssetTransfer({
      assetReceiver: this.highestBidder.get(),
      xferAsset: this.asa.get(),
      assetAmount: this.asaAmt.get(),
      fee: 0,
      assetCloseTo: assetCreator,
    });
  }

  @deleteApplication
  delete(): void {
    sendPayment({
      fee: 0,
      receiver: globals.creatorAddress,
      closeRemainderTo: globals.creatorAddress,
      amount: 0,
    });
  }
}

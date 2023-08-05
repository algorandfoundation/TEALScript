import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class Auction extends Contract {
  previousBidder = new GlobalStateKey<Address>();

  auctionEnd = new GlobalStateKey<uint64>();

  previousBid = new GlobalStateKey<uint64>();

  asaAmt = new GlobalStateKey<uint64>();

  asa = new GlobalStateKey<Asset>();

  claimableAmount = new LocalStateKey<uint64>();

  @allow.create()
  create(): void {
    this.auctionEnd.set(0);
    this.previousBid.set(0);
    this.asaAmt.set(0);
    this.asa.set(Asset.zeroIndex);

    // Use zero address rather than an empty string for Account type safety
    this.previousBidder.set(globals.zeroAddress);
  }

  optIntoAsset(asset: Asset): void {
    /// Only allow app creator to opt the app account into a ASA
    assert(this.txn.sender === globals.creatorAddress);

    /// Verify a ASA hasn't already been opted into
    assert(this.asa.get() === Asset.zeroIndex);

    /// Save ASA ID in global state
    this.asa.set(asset);

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
    this.asaAmt.set(axfer.assetAmount);
    this.auctionEnd.set(globals.latestTimestamp + length);
    this.previousBid.set(startingPrice);
  }

  private pay(receiver: Account, amount: uint64): void {
    sendPayment({
      receiver: receiver,
      amount: amount,
      fee: 0,
    });
  }

  @allow.call('OptIn')
  optIn(): void {}

  // eslint-disable-next-line no-unused-vars
  bid(payment: PayTxn): void {
    /// Ensure auction hasn't ended
    assert(globals.latestTimestamp < this.auctionEnd.get());

    /// Verify payment transaction
    assert(payment.amount > this.previousBid.get());
    assert(this.txn.sender === payment.sender);

    /// Set global state
    this.previousBid.set(payment.amount);
    this.previousBidder.set(payment.sender);

    /// Update claimable amount
    this.claimableAmount.set(this.txn.sender, payment.amount);
  }

  claimBids(): void {
    const originalAmount = this.claimableAmount.get(this.txn.sender);
    let amount = originalAmount;

    /// subtract previous bid if sender is previous bidder
    if (this.txn.sender === this.previousBidder.get()) amount = amount - this.previousBid.get();

    this.pay(this.txn.sender, amount);
    this.claimableAmount.set(this.txn.sender, originalAmount - amount);
  }

  claim_asset(asset: Asset): void {
    assert(globals.latestTimestamp > this.auctionEnd.get());

    /// Send ASA to previous bidder
    sendAssetTransfer({
      assetReceiver: this.previousBidder.get(),
      xferAsset: asset,
      assetAmount: this.asaAmt.get(),
      fee: 0,
      assetCloseTo: this.previousBidder.get(),
    });
  }

  @allow.call('OptIn')
  delete(): void {
    sendPayment({
      fee: 0,
      receiver: globals.creatorAddress,
      closeRemainderTo: globals.creatorAddress,
      amount: 0,
    });
  }
}

import { Contract } from '../../src/lib/index';

type TicketRange = {start: number, end: number};
// eslint-disable-next-line no-loss-of-precision
const RAND_MAX = 18_446_744_073_709_551_615;

// eslint-disable-next-line no-unused-vars
class NFTRaffle extends Contract {
  /** The app ID of the randomness oracle */
  randomnessOracle = GlobalStateKey<number>();

  /** The price of a single ticket (uALGO) */
  ticketPrice = GlobalStateKey<number>();

  /** The asset to be raffled */
  asset = GlobalStateKey<Asset>();

  /** After this round, tickets can no longer be purchased */
  endRound = GlobalStateKey<number>();

  /** The randomness oracle round commitment */
  drawRound = GlobalStateKey<number>();

  /** The range of tickets owned by each purchaser */
  tickets = BoxMap<Address, TicketRange>();

  /** The total number of tickets purchased */
  totalTickets = GlobalStateKey<number>();

  /** The winning ticket number */
  winningTicket = GlobalStateKey<number>();

  randomBytes = GlobalStateKey<bytes>();

  /**
   * Create the raffle
   *
   * @param ticketPrice The price of a single ticket (uALGO)
   * @param randomnessOracle The app ID of the randomness oracle
   *
   */
  createApplication(ticketPrice: number, randomnessOracle: number): void {
    this.randomnessOracle.value = randomnessOracle;
    this.ticketPrice.value = ticketPrice;
  }

  /**
   * Set the asset to be raffled
   *
   * @param asset The asset to be raffled
   *
   */
  setAsset(asset: Asset): void {
    assert(!this.asset.exists);

    sendAssetTransfer({
      assetReceiver: this.app.address,
      xferAsset: asset,
      assetAmount: 0,
      fee: 0,
    });

    this.asset.value = asset;
  }

  /**
   * Start the raffle
   *
   * @param end The round number when the raffle ends
   * @param draw The round number when the raffle is drawn
   *
   */
  startRaffle(end: number, draw: number): void {
    assert(this.app.address.assetBalance(this.asset.value) > 0);

    assert(draw > end);
    this.endRound.value = end;
    this.drawRound.value = draw;
  }

  /**
   * Buy tickets. Note this can only be called once!
   * It would be possible to allow multiple purchases, but
   * for simplicity, only one purchase is allowed.
   *
   * @param payment The payment for the tickets
   * @param quanity The number of tickets to buy
   *
   * @returns The total number of tickets owned by the sender
   */
  buyTickets(payment: PayTxn, quanity: number): void {
    assert(globals.round < this.endRound.value);
    assert(quanity > 0);

    assert(payment.amount === this.ticketPrice.value * quanity);
    assert(payment.sender === this.txn.sender);
    assert(payment.receiver === this.app.address);

    assert(!this.tickets(payment.sender).exists);

    const newTotal = this.totalTickets.value + quanity + 1;

    this.tickets(payment.sender).value = { start: this.totalTickets.value, end: newTotal - 1 };
    this.totalTickets.value = newTotal;
  }

  /** Get randomness from the oracle or by hashing existing randomness */
  private getRandomBytes(): void {
    if (this.randomBytes.exists) {
      this.randomBytes.value = sha256(this.randomBytes.value) as bytes;
    } else {
      this.randomBytes.value = sendMethodCall<[uint64, bytes], bytes>({
        name: 'must_get',
        methodArgs: [this.drawRound.value, ''],
        applicationID: Application.fromID(this.randomnessOracle.value),
        fee: 0,
        onCompletion: 'NoOp',
      });
    }
  }

  /** Draw the winning ticket */
  draw(): boolean {
    assert(!this.winningTicket.exists);
    this.getRandomBytes();

    // Continue to sample a uint64 from randomBytes until we get one that avoids modulo bias
    // See https://stackoverflow.com/a/46991999/12513465
    const n = this.totalTickets.value;
    let x: uint64;
    let offset = 0;
    let maxCondition: boolean;

    do {
      x = extract_uint64(this.randomBytes.value, offset);

      offset += 8;

      maxCondition = x > (RAND_MAX - (((RAND_MAX % n) + 1) % n));
    } while (maxCondition && offset < 32);

    if (maxCondition) return false;

    this.winningTicket.value = x % n;
    return true;
  }

  /** Send the asset to the the sender if they have the winning ticket */
  claim(): void {
    const ticketRange = this.tickets(this.txn.sender).value;

    assert(ticketRange.start <= this.winningTicket.value);
    assert(ticketRange.end >= this.winningTicket.value);

    sendAssetTransfer({
      assetReceiver: this.txn.sender,
      xferAsset: this.asset.value,
      assetAmount: this.app.address.assetBalance(this.asset.value),
      assetCloseTo: this.txn.sender,
      fee: 0,
    });
  }

  /**
   * Allows purchasers to get a refund if the winning ticket has not been drawn
   * and 1512 rounds have passed since the draw round, meaning the oracle no
   * longer has the data for the draw round
   */
  getRefund(): void {
    assert(!this.winningTicket.exists);
    assert(globals.round > this.drawRound.value + 1512);

    const ticketRange = this.tickets(this.txn.sender).value;
    const ticketCount = ticketRange.end - ticketRange.start + 1;

    this.tickets(this.txn.sender).delete();

    sendPayment({
      amount: this.ticketPrice.value * ticketCount,
      receiver: this.txn.sender,
      fee: 0,
    });
  }
}

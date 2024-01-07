import { Contract } from '../../src/lib/index';

type Whitelist = { account: Address; boxIndex: uint16; arc: string };

// eslint-disable-next-line no-unused-vars
class ARC75 extends Contract {
  whitelist = BoxMap<Whitelist, uint64[]>();

  private verifyMBRPayment(payment: PayTxn, preMBR: uint64): void {
    verifyPayTxn(payment, {
      receiver: this.app.address,
      amount: this.app.address.minBalance - preMBR,
    });
  }

  private sendMBRPayment(preMBR: uint64): void {
    sendPayment({
      receiver: this.txn.sender,
      amount: preMBR - this.app.address.minBalance,
    });
  }

  /**
   * Add app to whitelist box
   *
   * @param arc - The ARC the whitelist corresponds to
   * @param boxIndex - The index of the whitelist box to add the app to
   * @param appID - The app ID to add to the whitelist
   * @param payment - The payment transaction to cover the MBR change
   *
   */
  addAppToWhiteList(arc: string, boxIndex: uint16, appID: uint64, payment: PayTxn): void {
    const preMBR = this.app.address.minBalance;
    const whitelist: Whitelist = { account: this.txn.sender, boxIndex: boxIndex, arc: arc };

    if (this.whitelist(whitelist).exists) {
      this.whitelist(whitelist).value.push(appID);
    } else {
      const newWhitelist: uint64[] = [appID];
      this.whitelist(whitelist).value = newWhitelist;
    }

    this.verifyMBRPayment(payment, preMBR);
  }

  /**
   * Sets a app whitelist for the sender. Should only be used when adding/removing
   * more than one app
   *
   * @param boxIndex - The index of the whitelist box to put the app IDs in
   * @param appIDs - Array of app IDs that signify the whitelisted apps
   *
   */
  setAppWhitelist(arc: string, boxIndex: uint16, appIDs: uint64[]): void {
    const preMBR = this.app.address.minBalance;
    const whitelist: Whitelist = { account: this.txn.sender, boxIndex: boxIndex, arc: arc };

    this.whitelist(whitelist).delete();

    this.whitelist(whitelist).value = appIDs;

    if (preMBR > this.app.address.minBalance) {
      this.sendMBRPayment(preMBR);
    } else {
      this.verifyMBRPayment(this.txnGroup[this.txn.groupIndex - 1], preMBR);
    }
  }

  /**
   * Deletes a app whitelist for the sender
   *
   * @param arc - The ARC the whitelist corresponds to
   * @param boxIndex - The index of the whitelist box to delete
   *
   */
  deleteWhitelist(arc: string, boxIndex: uint16): void {
    const preMBR = this.app.address.minBalance;
    const whitelist: Whitelist = { account: this.txn.sender, boxIndex: boxIndex, arc: arc };

    this.whitelist(whitelist).delete();

    this.sendMBRPayment(preMBR);
  }

  /**
   * Deletes a app from a whitelist for the sender
   *
   * @param boxIndex - The index of the whitelist box to delete from
   * @param appID - The app ID to delete from the whitelist
   * @param index - The index of the app in the whitelist
   *
   */
  deleteAppFromWhitelist(arc: string, boxIndex: uint16, appID: uint64, index: uint64): void {
    const preMBR = this.app.address.minBalance;
    const whitelist: Whitelist = { account: this.txn.sender, boxIndex: boxIndex, arc: arc };

    const spliced = this.whitelist(whitelist).value.splice(index, 1);

    assert(spliced[0] === appID);

    this.sendMBRPayment(preMBR);
  }
}

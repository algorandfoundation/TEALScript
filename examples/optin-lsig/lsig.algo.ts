import { LogicSig } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class LsigExample extends LogicSig {
  /** Verify this is an opt in transaction */
  logic(): void {
    verifyTxn(this.txn, {
      typeEnum: TransactionType.AssetTransfer,
      amount: 0,
      assetReceiver: this.txn.sender,
      fee: 0,
      rekeyTo: globals.zeroAddress,
      assetCloseTo: globals.zeroAddress,
    });
  }
}

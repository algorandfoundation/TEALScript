import { LogicSig } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class LsigExample extends LogicSig {
  isOptInToAsset(a: Asset): void {
    verifyTxn(this.txn, {
      typeEnum: TransactionType.AssetTransfer,
      amount: 0,
      sender: this.txn.assetReceiver,
      xferAsset: a,
    });
  }
}

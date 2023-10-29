import { LogicSig } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class LsigExample extends LogicSig {
  private add(a: number, b: number): number {
    return a + b;
  }

  logic(a: Asset): void {
    verifyTxn(this.txn, {
      typeEnum: TransactionType.AssetTransfer,
      amount: this.add(1, 2),
      sender: this.txn.assetReceiver,
      xferAsset: a,
    });
  }
}

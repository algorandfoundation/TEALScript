import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  txnTypeEnum(): void {
    assert(this.txnGroup[0].typeEnum === TransactionType.Payment);
  }

  txnGroupLength(): uint64 {
    return this.txnGroup.length;
  }

  asserts(arg1: boolean, arg2: boolean): void {
    assert(arg1, arg2, arg1 === arg2);
  }

  verifyTxnFromArg(somePay: PayTxn): void {
    verifyTxn(somePay, { receiver: this.app.address, amount: 100_000 });
  }

  verifyTxnFromTxnGroup(): void {
    verifyTxn(this.txnGroup[0 + 1], { receiver: this.app.address, amount: 100_000 });
  }
}

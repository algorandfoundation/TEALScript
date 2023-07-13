import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  txnTypeEnum(): void {
    const t = this.txnGroup[0];
    assert(t.typeEnum === TransactionType.Payment);
  }
}

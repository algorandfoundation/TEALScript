import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class GeneralTest extends Contract {
  txnTypeEnum(): void {
    assert(this.txnGroup[0].typeEnum === TransactionType.Payment);
  }
}

import { Contract } from '../../src/lib';

class AVM11 extends Contract {
  voterOpcodes() {
    assert(this.txn.sender.voterBalance);
    assert(this.txn.sender.voterIncentiveEligible);
  }

  incentiveGlobals() {
    assert(globals.payoutsEnabled);
    assert(globals.payoutsGoOnlineFee);
    assert(globals.payoutsPercent);
    assert(globals.payoutsMinBalance);
    assert(globals.payoutsMaxBalance);
  }
}

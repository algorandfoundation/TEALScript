import { Contract } from '../../src/lib';

export class AVM11 extends Contract {
  voterOpcodes() {
    assert(this.txn.sender.voterBalance);
    // voter_params_get IncentiveEligible covered by incentiveEligible acct_param
  }

  incentiveGlobals() {
    assert(globals.payoutsEnabled);
    assert(globals.payoutsGoOnlineFee);
    assert(globals.payoutsPercent);
    assert(globals.payoutsMinBalance);
    assert(globals.payoutsMaxBalance);
  }

  onlineStakeOp() {
    assert(onlineStake());
  }

  accountParams() {
    assert(this.txn.sender.incentiveEligible);
    assert(this.txn.sender.lastHeartbeat);
    assert(this.txn.sender.lastProposed);
  }
}

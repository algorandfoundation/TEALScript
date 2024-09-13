import { Contract } from '../../src/lib';

export class AVM11 extends Contract {
  programVersion = 11;

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

  blockParams() {
    log(blocks[globals.round - 1].proposer);
    assert(blocks[globals.round - 1].feesCollected);
    assert(blocks[globals.round - 1].bonus);
    log(blocks[globals.round - 1].branch);
    log(blocks[globals.round - 1].feeSink);
    log(blocks[globals.round - 1].protocol);
    assert(blocks[globals.round - 1].txnCounter);
    assert(blocks[globals.round - 1].proposerPayout);
  }
}

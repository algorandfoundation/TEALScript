import { LogicSig } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class LsigInnerTxn extends LogicSig {
  logic(): void {
    sendPayment({
      receiver: this.txn.sender,
      amount: 0,
    });
  }
}

// eslint-disable-next-line no-unused-vars
class LsigInnerLog extends LogicSig {
  logic(): void {
    log('foo');
  }
}

// eslint-disable-next-line no-unused-vars
class LsigMultipleMethods extends LogicSig {
  foo(): void {
    assert(true);
  }

  logic(): void {
    assert(true);
  }
}

// eslint-disable-next-line no-unused-vars
class LsigNonVoid extends LogicSig {
  logic(): uint64 {
    return 1;
  }
}

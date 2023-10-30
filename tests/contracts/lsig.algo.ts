import { LogicSig, Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class BasicLsig extends LogicSig {
  logic(): void {
    assert(true);
  }
}

// eslint-disable-next-line no-unused-vars
class LsigWithArgs extends LogicSig {
  logic(a: Asset, b: uint64[]): void {
    assert(a);
    assert(b[2]);
  }
}

// eslint-disable-next-line no-unused-vars
class LsigWithPrivateMethod extends LogicSig {
  private privateMethod(): boolean {
    return true;
  }

  logic(): void {
    assert(this.privateMethod());
  }
}

// eslint-disable-next-line no-unused-vars
class ContractWithLsigProgram extends Contract {
  createApplication(): void {
    log(BasicLsig.program());
  }
}

// eslint-disable-next-line no-unused-vars
class ContratWithLsigAddress extends Contract {
  createApplication(): void {
    log(BasicLsig.address());
  }
}

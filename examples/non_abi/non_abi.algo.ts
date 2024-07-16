import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NonABIExample extends Contract {
  private add(x: uint64, y: uint64): uint64 {
    return x + y;
  }

  abiAdd(x: uint64, y: uint64): uint64 {
    return this.add(x, y);
  }

  @nonABIRouterFallback.call('NoOp')
  nonAbiAdd(): void {
    const x = btoi(this.txn.applicationArgs![0]);
    const y = btoi(this.txn.applicationArgs![1]);
    log(itob(this.add(x, y)));
  }

  @nonABIRouterFallback.call('UpdateApplication')
  nonAbiUpdate(): void {
    log('Updated!');
  }
}

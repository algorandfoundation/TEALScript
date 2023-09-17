import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class NonABIExample extends Contract {
  private add(x: number, y: number): number {
    return x + y;
  }

  abiAdd(x: number, y: number): number {
    return this.add(x, y);
  }

  @nonABIRouterFallback.call('NoOp')
  nonAbiAdd(): void {
    const x = btoi(this.txn.applicationArgs![0]);
    const y = btoi(this.txn.applicationArgs![1]);
    log(itob(this.add(x, y)));
  }
}

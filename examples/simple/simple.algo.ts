import { Contract } from '../../src/lib/index';

export default class Simple extends Contract {
  counter = new GlobalReference<uint64>({ key: 'counter' });

  @handle.createApplication
  createApp(): void { }

  incr(i: uint64): void {
    this.counter.put(this.counter.get() + i);
  }

  decr(i: uint64): void {
    this.counter.put(this.counter.get() - i);
  }

  add(a: uint256, b: uint256): uint256 {
    return a + b;
  }

  sub(a: uint256, b: uint256): uint256 {
    return a - b;
  }

  @handle.clearState
  clearState(): void {
    this.counter.put(this.counter.get() + 1);
  }
}

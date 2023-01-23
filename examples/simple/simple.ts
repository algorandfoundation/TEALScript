/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */

// eslint-disable-next-line import/no-unresolved, import/extensions
import { Contract } from '../../src/lib/index';

class Simple extends Contract {
  counter = new GlobalReference<uint64>({ key: 'counter' });

  @createApplication
  // @ts-ignore
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

  @clearState
  // @ts-ignore
  clearState(): void {
    this.counter.put(this.counter.get() + 1);
  }
}

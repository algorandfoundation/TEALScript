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

  @noOp
  // @ts-ignore
  blah(): void { }

  @clearState
  // @ts-ignore
  clearState(): void {
    assert(1);
  }

  incr(i: uint64): void {
    this.counter.put(this.counter.get() + i);
  }

  decr(i: uint64): void {
    this.counter.put(this.counter.get() - i);
  }
}

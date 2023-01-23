/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */

// eslint-disable-next-line import/no-unresolved, import/extensions
import { Contract } from '../../src/lib/index';

class SimpleClear extends Contract {
  @main
  main() : void {
    assert(1);
  }
}

class Simple extends Contract {
  // clear: SimpleClear = new SimpleClear();

  counter = new GlobalReference<uint64>({ key: 'counter' });

  @updateApplication
  @noOp
  @createApplication
  createApp(): void { }

  @noOp
  blah(): void {

  }

  incr(i: uint64): void {
    this.counter.put(this.counter.get() + i);
  }

  decr(i: uint64): void {
    this.counter.put(this.counter.get() - i);
  }
}

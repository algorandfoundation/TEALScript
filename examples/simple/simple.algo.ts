import { Contract } from '../../src/lib/index';

export default class Simple extends Contract {
  counter = new GlobalStateKey<uint64>({ key: 'counter' });

  @handle.createApplication
  createApp(): void { }

  incr(i: uint64): void {
    this.counter.set(this.counter.get() + i);
  }

  decr(i: uint64): void {
    this.counter.set(this.counter.get() - i);
  }

  add(a: uint<256>, b: uint<256>): uint<256> {
    return (a + b) as uint<256>;
  }

  sub(a: uint<256>, b: uint<256>): uint<256> {
    return (a - b) as uint<256>;
  }

  @handle.clearState
  clearState(): void {
    this.counter.set(this.counter.get() + 1);
  }
}

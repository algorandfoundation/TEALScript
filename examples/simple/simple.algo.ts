import { Contract } from '../../src/lib/index';

export default class Simple extends Contract {
  counter = new GlobalStateKey<uint64>({ key: 'counter' });

  incr(i: uint64): void {
    this.counter.set(this.counter.get() + i);
  }

  decr(i: uint64): void {
    this.counter.set(this.counter.get() - i);
  }

  add(a: uint<256>, b: uint<256>): uint<256> {
    return a + b;
  }

  sub(a: uint<256>, b: uint<256>): uint<256> {
    return a - b;
  }

  clearState(): void {
    this.counter.set(this.counter.get() + 1);
  }
}

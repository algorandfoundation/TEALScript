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

  add(a: uint<256>, b: uint<256>): uint<256> {
    return a + b;
  }

  sub(a: uint<256>, b: uint<256>): uint<256> {
    return a - b;
  }

  @handle.clearState
  clearState(): void {
    this.counter.put(this.counter.get() + 1);
  }
}

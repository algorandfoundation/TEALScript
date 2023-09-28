import { Contract } from '../../src/lib/index';

export default class Simple extends Contract {
  counter = GlobalStateKey<uint64>({ key: 'counter' });

  private incrementCounter(i: uint64): void {
    this.counter.value = this.counter.value + i;
  }

  incr(i: uint64): void {
    this.incrementCounter(i);
  }

  decr(i: uint64): void {
    this.counter.value = this.counter.value - i;
  }

  add(a: uint<256>, b: uint<256>): uint<256> {
    return a + b;
  }

  sub(a: uint<256>, b: uint<256>): uint<256> {
    return a - b;
  }

  clearState(): void {
    this.incrementCounter(1);
  }
}

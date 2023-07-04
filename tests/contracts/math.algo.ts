import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class MathTest extends Contract {
  u64plus(a: uint64, b: uint64): uint64 {
    return a + b;
  }

  u64minus(a: uint64, b: uint64): uint64 {
    return a - b;
  }

  u64mul(a: uint64, b: uint64): uint64 {
    return a * b;
  }

  u64div(a: uint64, b: uint64): uint64 {
    return a / b;
  }

  u256plus(a: uint<256>, b: uint<256>): uint<256> {
    return (a + b) as uint<256>;
  }

  u256minus(a: uint<256>, b: uint<256>): uint<256> {
    return (a - b) as uint<256>;
  }

  u256mul(a: uint<256>, b: uint<256>): uint<256> {
    return (a * b) as uint<256>;
  }

  u256div(a: uint<256>, b: uint<256>): uint<256> {
    return (a / b) as uint<256>;
  }

  u64Return256(a: uint64, b: uint64): uint<256> {
    return (a + b) as uint<256>;
  }

  maxU64(): void {
    // eslint-disable-next-line no-loss-of-precision
    assert(18_446_744_073_709_551_615);
  }
}

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class MathTest extends Contract {
  gKey = GlobalStateKey<uint64>();

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
    return a + b;
  }

  u256minus(a: uint<256>, b: uint<256>): uint<256> {
    return a - b;
  }

  u256mul(a: uint<256>, b: uint<256>): uint<256> {
    return a * b;
  }

  u256div(a: uint<256>, b: uint<256>): uint<256> {
    return a / b;
  }

  u64Return256(a: uint64, b: uint64): uint<256> {
    return a + b;
  }

  maxU64(): uint64 {
    // eslint-disable-next-line no-loss-of-precision
    return 18_446_744_073_709_551_615;
  }

  btobigintFirst(input: string): uint64 {
    return btobigint(input) / 1;
  }

  btobigintSecond(input: string): uint64 {
    return 1000 / btobigint(input);
  }

  exponent(a: uint64, b: uint64): uint64 {
    return a ** b;
  }

  variableTypeHint(x: uint<8>, y: uint<8>): uint<16> {
    const z: uint<16> = x + y;

    return z;
  }

  uint8plus(a: uint<8>, b: uint<8>): uint<8> {
    return a + b;
  }

  uint8exp(a: uint<8>, b: uint<8>): uint<8> {
    return a ** b;
  }
}

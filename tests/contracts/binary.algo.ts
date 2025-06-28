import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class BinaryTest extends Contract {
  and(a: uint64, b: uint64): void {
    assert(a && b);
  }

  or(a: uint64, b: uint64): void {
    assert(a || b);
  }

  equal(a: uint64, b: uint64): void {
    assert(a === b);
  }

  notEqual(a: uint64, b: uint64): void {
    assert(a !== b);
  }

  bitAnd(a: uint64, b: uint64): void {
    assert(a & b);
  }

  bitOr(a: uint64, b: uint64): void {
    assert(a | b);
  }

  bitXor(a: uint64, b: uint64): void {
    assert(a ^ b);
  }

  combo(a: uint64, b: uint64, c: uint64): void {
    assert(a || (b && c));
  }

  bitwiseXorOp(a: bytes, b: bytes): void {
    bitwiseXor(a, b);
  }

  bitwiseAndOp(a: bytes, b: bytes): void {
    bitwiseAnd(a, b);
  }

  bitwiseOrOp(a: bytes, b: bytes): void {
    bitwiseOr(a, b);
  }

  bitwiseNotOp(a: bytes): void {
    bitwiseNot(a);
  }
}

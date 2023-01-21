/* eslint-disable no-bitwise */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

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
}

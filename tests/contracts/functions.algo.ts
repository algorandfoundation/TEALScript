import { Contract } from '../../src/lib/index';

function nonClassFunction(a: uint64, b: uint64): uint64 {
  return a + b;
}

export class FunctionsTest extends Contract {
  callNonClassFunction(a: uint64, b: uint64): uint64 {
    return nonClassFunction(a, b);
  }
}

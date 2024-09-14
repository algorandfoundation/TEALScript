// eslint-disable-next-line import/no-extraneous-dependencies
import { packageFunction } from 'tealscript_test_package';
import { Contract } from '../../src/lib/index';
import { externalFunction } from './functions-external.algo';

function nonClassFunction(a: uint64, b: uint64): uint64 {
  return a + b;
}

export class FunctionsTest extends Contract {
  callNonClassFunction(a: uint64, b: uint64): uint64 {
    return nonClassFunction(a, b);
  }

  callExternalFunction(a: uint64, b: uint64): uint64 {
    return externalFunction(a, b);
  }

  callPackageFunction(a: uint64, b: uint64): uint64 {
    return packageFunction(a, b);
  }
}

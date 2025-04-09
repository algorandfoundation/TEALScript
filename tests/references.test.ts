import { describe, test, expect } from '@jest/globals';
import algosdk from 'algosdk';
import { compileAndCreate } from './common';

const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

function compilerErrorTest(contractName: string, errorMsg: string) {
  test(contractName, async () => {
    let msg: string;
    try {
      await compileAndCreate(
        algosdk.generateAccount(),
        'tests/contracts/reference_compile_errors.algo.ts',
        ARTIFACTS_DIR,
        contractName
      );
      msg = 'No error';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      msg = e.message;
    }

    expect(msg).toMatch(errorMsg);
  });
}

describe('Reference Compile Errors', () => {
  compilerErrorTest('MutableRefInObjLiteral', 'Cannot have multiple multiple references to the same object');
  compilerErrorTest('MutableRefInObjAssignment', 'Cannot have multiple multiple references to the same object');
  compilerErrorTest('MutableRefInArrayLiteral', 'Cannot have multiple multiple references to the same object');
  compilerErrorTest('MutableRefInArrayAssignment', 'Cannot have multiple multiple references to the same object');
  compilerErrorTest('MutableRefInPush', 'Cannot push to dynamic array of dynamic types');
});

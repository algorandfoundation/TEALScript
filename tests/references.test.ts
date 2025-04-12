import { describe, test, expect } from '@jest/globals';
import algosdk from 'algosdk';
import { compileAndCreate } from './common';

const ARTIFACTS_DIR = 'tests/contracts/artifacts';

function compilerErrorTest(contractName: string, errorMsg: string, line: string) {
  test(contractName, async () => {
    let msg: string;
    try {
      await compileAndCreate(
        algosdk.generateAccount(),
        `tests/contracts/reference_errors/${contractName}.algo.ts`,
        ARTIFACTS_DIR,
        contractName
      );
      msg = 'No error';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (!(e.message as string).match(errorMsg)) {
        throw e;
      }
      msg = e.message;
    }

    expect(msg).toMatch(errorMsg);
    expect(msg).toMatch(line);
  });
}

describe('Reference Compile Errors', () => {
  compilerErrorTest(
    'MutableRefInObjLiteral',
    'Cannot access or create a reference to an mutable type',
    'const arrObj: ArrObj = { arr: arr }'
  );

  compilerErrorTest(
    'MutableRefInObjAssignment',
    'Cannot access or create a reference to an mutable type',
    'arrObj.arr = arr'
  );

  compilerErrorTest('MutableRefInArrayLiteral', 'Cannot access or create a reference to an mutable type', 'arr[0] = 4');

  compilerErrorTest(
    'MutableRefInArrayAssignment',
    'Cannot access or create a reference to an mutable type',
    'arrArr[0] = arr'
  );

  compilerErrorTest('MutableRefInPush', 'Cannot access or create a reference to an mutable type', 'arr[0] = 4');
});

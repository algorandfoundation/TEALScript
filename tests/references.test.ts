import { describe, test, expect } from '@jest/globals';
import algosdk from 'algosdk';
import { compileAndCreate } from './common';

const ARTIFACTS_DIR = 'tests/contracts/artifacts';

function compilerErrorTest(contractName: string, errorMsg: string) {
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
      // if (!(e.message as string).match(errorMsg)) {
      //   throw e;
      // }
      msg = e.message;
    }

    expect(msg).toMatch(errorMsg);
  });
}

describe('Reference Compile Errors', () => {
  compilerErrorTest('ArrayWithAliasMutation', 'assert(arrWithVal[0][2] === 3)');
  compilerErrorTest('ArrayWithRefMutation', 'assert(val[2] === 3)');
  compilerErrorTest('ArrayWithNestedRefMutation', 'assert(val[2] === 3)');
});

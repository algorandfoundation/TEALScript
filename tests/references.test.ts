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
  compilerErrorTest('ArrayInObjWithAliasMutation', 'assert(objWithVal.arr[2] === 3)');
  compilerErrorTest('ArrayInObjWithRefMutation', 'assert(val[2] === 3)');
  compilerErrorTest('ArrayInObjWithNestedRefMutation', 'assert(val[2] === 3)');
  compilerErrorTest('ObjWithAliasMutation', 'assert(objWithVal.bar.foo === 7331)');
  compilerErrorTest('ObjWithRefMutation', 'assert(val.foo === 7331)');
  compilerErrorTest('ObjWithNestedRefMutation', 'assert(val.foo === 7331)');
  compilerErrorTest('ArrayWithFnMutation', 'assert(arrWithVal[0][2] === 3)');
  compilerErrorTest('ArrayAssignmentWithAliasMutation', 'assert(arrWithVal[0][2] === 3)');
  compilerErrorTest('ObjAssignmentWithAliasMutation', 'assert(objWithVal.bar.foo === 7331)');
  compilerErrorTest('ObjRefAndMutation', 'assert(cmpStaker.balance === 2)');
});

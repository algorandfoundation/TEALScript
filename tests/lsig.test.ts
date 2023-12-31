/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { describe, expect, test } from '@jest/globals';
import algosdk from 'algosdk';
import { artifactsTest, compileAndCreate } from './common';

const PATH = 'tests/contracts/lsig.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';

describe('Logic Signatures', function () {
  artifactsTest(PATH, ARTIFACTS_DIR, 'BasicLsig', true);
  artifactsTest(PATH, ARTIFACTS_DIR, 'LsigWithArgs', true);
  artifactsTest(PATH, ARTIFACTS_DIR, 'LsigWithPrivateMethod', true);

  describe('Compile Errors', function () {
    const errorMessages = {
      LsigInnerTxn: 'Inner transaction not allowed in logic signatures',
      LsigInnerLog: 'Logic signatures cannot log data',
      LsigMultipleMethods: 'Only one method called "logic" can be defined in a logic signature',
      LsigNonVoid: 'logic method must have a void return type',
    };

    Object.keys(errorMessages).forEach(function (contractName) {
      test(contractName, async function () {
        let msg: string;
        try {
          await compileAndCreate(
            algosdk.generateAccount(),
            'tests/contracts/lsig_compile_errors.algo.ts',
            ARTIFACTS_DIR,
            contractName
          );
          msg = 'No error';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          msg = e.message;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(msg).toMatch((errorMessages as any)[contractName]);
      });
    });
  });
});

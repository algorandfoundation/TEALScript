/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import * as algokit from '@algorandfoundation/algokit-utils';
import { describe, test, expect } from '@jest/globals';
import { artifactsTest, compileAndCreate, runMethod, algodClient, kmdClient } from './common';

const PATH = 'tests/contracts/if.algo.ts';
const ARTIFACTS_DIR = 'tests/contracts/artifacts/';
const NAME = 'IfTest';

describe('If', function () {
  artifactsTest('tests/contracts/if.algo.ts', 'tests/contracts/artifacts/', 'IfTest');

  describe('E2E', function () {
    const sender = algokit.getLocalNetDispenserAccount(algodClient, kmdClient);

    test('singleIf', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'singleIf', methodArgs: [true] })).toBe('if');
      expect(await runMethod({ appClient, method: 'singleIf', methodArgs: [false] })).toBe('end');
    });

    test('ifElse', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'ifElse', methodArgs: [true] })).toBe('if');
      expect(await runMethod({ appClient, method: 'ifElse', methodArgs: [false] })).toBe('else');
    });

    test('ifElseIf', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'ifElseIf', methodArgs: [true, false] })).toBe('if');
      expect(await runMethod({ appClient, method: 'ifElseIf', methodArgs: [false, true] })).toBe('else if');
      expect(await runMethod({ appClient, method: 'ifElseIf', methodArgs: [false, false] })).toBe('end');
    });

    test('ifElseIfElse', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'ifElseIfElse', methodArgs: [true, false] })).toBe('if');
      expect(await runMethod({ appClient, method: 'ifElseIfElse', methodArgs: [false, true] })).toBe('else if');
      expect(await runMethod({ appClient, method: 'ifElseIfElse', methodArgs: [false, false] })).toBe('else');
    });

    test('ifElseIfElseIf', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'ifElseIfElseIf', methodArgs: [true, false, false] })).toBe('if');
      expect(await runMethod({ appClient, method: 'ifElseIfElseIf', methodArgs: [false, true, false] })).toBe(
        'else if 1'
      );
      expect(await runMethod({ appClient, method: 'ifElseIfElseIf', methodArgs: [false, false, true] })).toBe(
        'else if 2'
      );
      expect(await runMethod({ appClient, method: 'ifElseIfElseIf', methodArgs: [false, false, false] })).toBe('end');
    });

    test('ifElseIfElseIfElse', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'ifElseIfElseIfElse', methodArgs: [true, false, false] })).toBe('if');
      expect(await runMethod({ appClient, method: 'ifElseIfElseIfElse', methodArgs: [false, true, false] })).toBe(
        'else if 1'
      );
      expect(await runMethod({ appClient, method: 'ifElseIfElseIfElse', methodArgs: [false, false, true] })).toBe(
        'else if 2'
      );
      expect(await runMethod({ appClient, method: 'ifElseIfElseIfElse', methodArgs: [false, false, false] })).toBe(
        'else'
      );
    });

    test('nestedIf', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'nestedIf', methodArgs: [true, true] })).toBe('nested if');
      expect(await runMethod({ appClient, method: 'nestedIf', methodArgs: [true, false] })).toBe('if');
      expect(await runMethod({ appClient, method: 'nestedIf', methodArgs: [false, false] })).toBe('else');
    });

    test('bracketlessIfElse', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'bracketlessIfElse', methodArgs: [true] })).toBe('if');
      expect(await runMethod({ appClient, method: 'bracketlessIfElse', methodArgs: [false] })).toBe('else');
    });

    test('nestedTernary', async function () {
      const { appClient } = await compileAndCreate(await sender, PATH, ARTIFACTS_DIR, NAME);
      expect(await runMethod({ appClient, method: 'nestedTernary', methodArgs: [true, false] })).toBe(1n);
      expect(await runMethod({ appClient, method: 'nestedTernary', methodArgs: [false, true] })).toBe(2n);
      expect(await runMethod({ appClient, method: 'nestedTernary', methodArgs: [false, false] })).toBe(3n);
    });
  });
});

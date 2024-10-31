/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { test, expect, describe } from '@jest/globals';
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/binary.algo.ts', 'BinaryTest', methodName);
}

describe('Binary Expressions', function () {
  artifactsTest('tests/contracts/binary.algo.ts', 'tests/contracts/artifacts/', 'BinaryTest');

  test('&&', async function () {
    const teal = await getTeal('and');
    expect(teal).toEqual([
      '// assert(a && b)',
      'frame_dig -1 // a: uint64',
      'dup',
      'bz *skip_and0',
      'frame_dig -2 // b: uint64',
      '&&',
      '*skip_and0:',
      'assert',
    ]);
  });

  test('||', async function () {
    const teal = await getTeal('or');
    expect(teal).toEqual([
      '// assert(a || b)',
      'frame_dig -1 // a: uint64',
      'dup',
      'bnz *skip_or0',
      'frame_dig -2 // b: uint64',
      '||',
      '*skip_or0:',
      'assert',
    ]);
  });

  test('combo', async function () {
    const teal = await getTeal('combo');
    expect(teal).toEqual([
      '// assert(a || (b && c))',
      'frame_dig -1 // a: uint64',
      'dup',
      'bnz *skip_or1',
      'frame_dig -2 // b: uint64',
      'dup',
      'bz *skip_and1',
      'frame_dig -3 // c: uint64',
      '&&',
      '*skip_and1:',
      '||',
      '*skip_or1:',
      'assert',
    ]);
  });

  test('==', async function () {
    const teal = await getTeal('equal');
    expect(teal).toEqual([
      '// assert(a === b)',
      'frame_dig -1 // a: uint64',
      'frame_dig -2 // b: uint64',
      '==',
      'assert',
    ]);
  });

  test('!=', async function () {
    const teal = await getTeal('notEqual');
    expect(teal).toEqual([
      '// assert(a !== b)',
      'frame_dig -1 // a: uint64',
      'frame_dig -2 // b: uint64',
      '!=',
      'assert',
    ]);
  });

  test('&', async function () {
    const teal = await getTeal('bitAnd');
    expect(teal).toEqual(['// assert(a & b)', 'frame_dig -1 // a: uint64', 'frame_dig -2 // b: uint64', '&', 'assert']);
  });

  test('|', async function () {
    const teal = await getTeal('bitOr');
    expect(teal).toEqual(['// assert(a | b)', 'frame_dig -1 // a: uint64', 'frame_dig -2 // b: uint64', '|', 'assert']);
  });

  test('^', async function () {
    const teal = await getTeal('bitXor');
    expect(teal).toEqual(['// assert(a ^ b)', 'frame_dig -1 // a: uint64', 'frame_dig -2 // b: uint64', '^', 'assert']);
  });
});

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
// eslint-disable-next-line import/no-unresolved, import/extensions
import { test, expect, describe } from '@jest/globals';
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/math.algo.ts', 'MathTest', methodName);
}

artifactsTest('MathTest', 'tests/contracts/math.algo.ts', 'tests/contracts/artifacts/', 'MathTest');

describe('Math', function () {
  test('uint64 +', async function () {
    const teal = await getTeal('u64plus');
    expect(teal).toEqual(
      [
        '// return a + b;',
        'frame_dig -1 // a: uint64',
        'frame_dig -2 // b: uint64',
        '+',
        'itob',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint64 -', async function () {
    const teal = await getTeal('u64minus');
    expect(teal).toEqual(
      [
        '// return a - b;',
        'frame_dig -1 // a: uint64',
        'frame_dig -2 // b: uint64',
        '-',
        'itob',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint64 *', async function () {
    const teal = await getTeal('u64mul');
    expect(teal).toEqual(
      [
        '// return a * b;',
        'frame_dig -1 // a: uint64',
        'frame_dig -2 // b: uint64',
        '*',
        'itob',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint64 /', async function () {
    const teal = await getTeal('u64div');
    expect(teal).toEqual(
      [
        '// return a / b;',
        'frame_dig -1 // a: uint64',
        'frame_dig -2 // b: uint64',
        '/',
        'itob',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint256 b+', async function () {
    const teal = await getTeal('u256plus');
    expect(teal).toEqual(
      [
        '// return a + b;',
        'frame_dig -1 // a: uint256',
        'frame_dig -2 // b: uint256',
        'b+',
        'byte 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'b&',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint256 b-', async function () {
    const teal = await getTeal('u256minus');
    expect(teal).toEqual(
      [
        '// return a - b;',
        'frame_dig -1 // a: uint256',
        'frame_dig -2 // b: uint256',
        'b-',
        'byte 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'b&',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint256 b*', async function () {
    const teal = await getTeal('u256mul');
    expect(teal).toEqual(
      [
        '// return a * b;',
        'frame_dig -1 // a: uint256',
        'frame_dig -2 // b: uint256',
        'b*',
        'byte 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'b&',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint256 b/', async function () {
    const teal = await getTeal('u256div');
    expect(teal).toEqual(
      [
        '// return a / b;',
        'frame_dig -1 // a: uint256',
        'frame_dig -2 // b: uint256',
        'b/',
        'byte 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'b&',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('uint64 -> uint256', async function () {
    const teal = await getTeal('u64Return256');
    expect(teal).toEqual(
      [
        '// return a + b;',
        'frame_dig -1 // a: uint64',
        'frame_dig -2 // b: uint64',
        '+',
        'itob',
        'byte 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'b&',
        'byte 0x151f7c75',
        'swap',
        'concat',
        'log',
      ],
    );
  });

  test('max uint64', async function () {
    const teal = await getTeal('maxU64');
    expect(teal).toEqual(
      [
        '// assert(18_446_744_073_709_551_615)',
        'int 18_446_744_073_709_551_615',
        'assert',
      ],
    );
  });
});

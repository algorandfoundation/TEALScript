/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/math.ts', 'MathTest', methodName);
}

artifactsTest('MathTest', 'tests/contracts/math.ts', 'tests/contracts/', 'MathTest');

describe('Math', function () {
  it('uint64 +', async function () {
    const teal = await getTeal('u64plus');
    expect(teal).to.deep.equal(
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

  it('uint64 -', async function () {
    const teal = await getTeal('u64minus');
    expect(teal).to.deep.equal(
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

  it('uint64 *', async function () {
    const teal = await getTeal('u64mul');
    expect(teal).to.deep.equal(
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

  it('uint64 /', async function () {
    const teal = await getTeal('u64div');
    expect(teal).to.deep.equal(
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

  it('uint256 b+', async function () {
    const teal = await getTeal('u256plus');
    expect(teal).to.deep.equal(
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

  it('uint256 b-', async function () {
    const teal = await getTeal('u256minus');
    expect(teal).to.deep.equal(
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

  it('uint256 b*', async function () {
    const teal = await getTeal('u256mul');
    expect(teal).to.deep.equal(
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

  it('uint256 b/', async function () {
    const teal = await getTeal('u256div');
    expect(teal).to.deep.equal(
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

  it('uint64 -> uint256', async function () {
    const teal = await getTeal('u64Return256');
    expect(teal).to.deep.equal(
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

  it('max uint64', async function () {
    const teal = await getTeal('maxU64');
    expect(teal).to.deep.equal(
      [
        '// assert(18_446_744_073_709_551_615)',
        'int 18_446_744_073_709_551_615',
        'assert',
      ],
    );
  });
});

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { getMethodTeal } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/binary.ts', 'BinaryTest', methodName);
}

describe('Binary Expressions', function () {
  it('&&', async function () {
    const teal = await getTeal('and');
    expect(teal).to.deep.equal(
      [
        '// assert(a && b)',
        'frame_dig -128 // a: uint64',
        'dup',
        'bz skip_and0',
        'frame_dig -127 // b: uint64',
        '&&',
        'skip_and0:',
        'assert',
      ],
    );
  });

  it('||', async function () {
    const teal = await getTeal('or');
    expect(teal).to.deep.equal(
      [
        '// assert(a || b)',
        'frame_dig -128 // a: uint64',
        'dup',
        'bnz skip_or0',
        'frame_dig -127 // b: uint64',
        '||',
        'skip_or0:',
        'assert',
      ],
    );
  });

  it('combo', async function () {
    const teal = await getTeal('combo');
    expect(teal).to.deep.equal(
      [
        '// assert(a || (b && c))',
        'frame_dig -128 // a: uint64',
        'dup',
        'bnz skip_or1',
        'frame_dig -127 // b: uint64',
        'dup',
        'bz skip_and1',
        'frame_dig -126 // c: uint64',
        '&&',
        'skip_and1:',
        '||',
        'skip_or1:',
        'assert',
      ],
    );
  });

  it('==', async function () {
    const teal = await getTeal('equal');
    expect(teal).to.deep.equal(
      [
        '// assert(a === b)',
        'frame_dig -128 // a: uint64',
        'frame_dig -127 // b: uint64',
        '==',
        'assert',
      ],
    );
  });

  it('!=', async function () {
    const teal = await getTeal('notEqual');
    expect(teal).to.deep.equal(
      [
        '// assert(a !== b)',
        'frame_dig -128 // a: uint64',
        'frame_dig -127 // b: uint64',
        '!=',
        'assert',
      ],
    );
  });

  it('&', async function () {
    const teal = await getTeal('bitAnd');
    expect(teal).to.deep.equal(
      [
        '// assert(a & b)',
        'frame_dig -128 // a: uint64',
        'frame_dig -127 // b: uint64',
        '&',
        'assert',
      ],
    );
  });

  it('|', async function () {
    const teal = await getTeal('bitOr');
    expect(teal).to.deep.equal(
      [
        '// assert(a | b)',
        'frame_dig -128 // a: uint64',
        'frame_dig -127 // b: uint64',
        '|',
        'assert',
      ],
    );
  });

  it('^', async function () {
    const teal = await getTeal('bitXor');
    expect(teal).to.deep.equal(
      [
        '// assert(a ^ b)',
        'frame_dig -128 // a: uint64',
        'frame_dig -127 // b: uint64',
        '^',
        'assert',
      ],
    );
  });
});

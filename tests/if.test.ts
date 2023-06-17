/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect } from 'chai';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/if.algo.ts', 'IfTest', methodName);
}

artifactsTest('IfTest', 'tests/contracts/if.algo.ts', 'tests/contracts/artifacts/', 'IfTest');

describe('If', function () {
  it('singleIf', async function () {
    const teal = await getTeal('singleIf');
    expect(teal).to.deep.equal(
      [
        '// if0_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if0_end',
        '// if0_consequent',
        "// log('If')",
        'byte "If"',
        'log',
        'if0_end:',
      ],
    );
  });

  it('ifElse', async function () {
    const teal = await getTeal('ifElse');
    expect(teal).to.deep.equal(
      [
        '// if1_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if1_else',
        '// if1_consequent',
        "// log('If')",
        'byte "If"',
        'log',
        'b if1_end',
        'if1_else:',
        "// log('else')",
        'byte "else"',
        'log',
        'if1_end:',
      ],
    );
  });

  it('ifElseIf', async function () {
    const teal = await getTeal('ifElseIf');
    expect(teal).to.deep.equal(
      [
        '// if2_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if2_elseif1_condition',
        '// if2_consequent',
        "// log('If')",
        'byte "If"',
        'log',
        'b if2_end',
        'if2_elseif1_condition:',
        '// assert(2)',
        'int 2',
        'assert',
        'bz if2_end',
        '// if2_elseif1_consequent',
        "// log('else if')",
        'byte "else if"',
        'log',
        'if2_end:',
      ],
    );
  });

  it('ifElseIfElse', async function () {
    const teal = await getTeal('ifElseIfElse');
    expect(teal).to.deep.equal(
      [
        '// if3_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if3_elseif1_condition',
        '// if3_consequent',
        "// log('If')",
        'byte "If"',
        'log',
        'b if3_end',
        'if3_elseif1_condition:',
        '// assert(2)',
        'int 2',
        'assert',
        'bz if3_else',
        '// if3_elseif1_consequent',
        "// log('else if')",
        'byte "else if"',
        'log',
        'b if3_end',
        'if3_else:',
        "// log('else')",
        'byte "else"',
        'log',
        'if3_end:',
      ],
    );
  });

  it('ifElseIfElseIf', async function () {
    const teal = await getTeal('ifElseIfElseIf');
    expect(teal).to.deep.equal(
      [
        '// if4_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if4_elseif1_condition',
        '// if4_consequent',
        "// log('if')",
        'byte "if"',
        'log',
        'b if4_end',
        'if4_elseif1_condition:',
        '// assert(2)',
        'int 2',
        'assert',
        'bz if4_elseif2_condition',
        '// if4_elseif1_consequent',
        "// log('else if 1')",
        'byte "else if 1"',
        'log',
        'b if4_end',
        'if4_elseif2_condition:',
        '// assert(3)',
        'int 3',
        'assert',
        'bz if4_end',
        '// if4_elseif2_consequent',
        "// log('else if 2')",
        'byte "else if 2"',
        'log',
        'if4_end:',
      ],
    );
  });

  it('ifElseIfElseIfElse', async function () {
    const teal = await getTeal('ifElseIfElseIfElse');
    expect(teal).to.deep.equal(
      [
        '// if5_condition',
        '// assert(1)',
        'int 1',
        'assert',
        'bz if5_elseif1_condition',
        '// if5_consequent',
        "// log('if')",
        'byte "if"',
        'log',
        'b if5_end',
        'if5_elseif1_condition:',
        '// assert(2)',
        'int 2',
        'assert',
        'bz if5_elseif2_condition',
        '// if5_elseif1_consequent',
        "// log('else if 1')",
        'byte "else if 1"',
        'log',
        'b if5_end',
        'if5_elseif2_condition:',
        '// assert(3)',
        'int 3',
        'assert',
        'bz if5_else',
        '// if5_elseif2_consequent',
        "// log('else if 2')",
        'byte "else if 2"',
        'log',
        'b if5_end',
        'if5_else:',
        "// log('else')",
        'byte "else"',
        'log',
        'if5_end:',
      ],
    );
  });
});

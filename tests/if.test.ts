/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
import { expect, test, describe } from '@jest/globals';
import { getMethodTeal, artifactsTest } from './common';

async function getTeal(methodName: string) {
  return getMethodTeal('tests/contracts/if.algo.ts', 'IfTest', methodName);
}

artifactsTest('IfTest', 'tests/contracts/if.algo.ts', 'tests/contracts/artifacts/', 'IfTest');

describe('If', function () {
  test('singleIf', async function () {
    const teal = await getTeal('singleIf');
    expect(teal).toEqual([
      '// if0_condition',
      '// 1',
      'int 1',
      'bz if0_end',
      '// if0_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'if0_end:',
    ]);
  });

  test('ifElse', async function () {
    const teal = await getTeal('ifElse');
    expect(teal).toEqual([
      '// if1_condition',
      '// 1',
      'int 1',
      'bz if1_else',
      '// if1_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'b if1_end',
      'if1_else:',
      "// log('else')",
      'byte 0x656c7365 // "else"',
      'log',
      'if1_end:',
    ]);
  });

  test('ifElseIf', async function () {
    const teal = await getTeal('ifElseIf');
    expect(teal).toEqual([
      '// if2_condition',
      '// 1',
      'int 1',
      'bz if2_elseif1_condition',
      '// if2_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'b if2_end',
      'if2_elseif1_condition:',
      '// 2',
      'int 2',
      'bz if2_end',
      '// if2_elseif1_consequent',
      "// log('else if')",
      'byte 0x656c7365206966 // "else if"',
      'log',
      'if2_end:',
    ]);
  });

  test('ifElseIfElse', async function () {
    const teal = await getTeal('ifElseIfElse');
    expect(teal).toEqual([
      '// if3_condition',
      '// 1',
      'int 1',
      'bz if3_elseif1_condition',
      '// if3_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'b if3_end',
      'if3_elseif1_condition:',
      '// 2',
      'int 2',
      'bz if3_else',
      '// if3_elseif1_consequent',
      "// log('else if')",
      'byte 0x656c7365206966 // "else if"',
      'log',
      'b if3_end',
      'if3_else:',
      "// log('else')",
      'byte 0x656c7365 // "else"',
      'log',
      'if3_end:',
    ]);
  });

  test('ifElseIfElseIf', async function () {
    const teal = await getTeal('ifElseIfElseIf');
    expect(teal).toEqual([
      '// if4_condition',
      '// 1',
      'int 1',
      'bz if4_elseif1_condition',
      '// if4_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'b if4_end',
      'if4_elseif1_condition:',
      '// 2',
      'int 2',
      'bz if4_elseif2_condition',
      '// if4_elseif1_consequent',
      "// log('else if 1')",
      'byte 0x656c73652069662031 // "else if 1"',
      'log',
      'b if4_end',
      'if4_elseif2_condition:',
      '// 3',
      'int 3',
      'bz if4_end',
      '// if4_elseif2_consequent',
      "// log('else if 2')",
      'byte 0x656c73652069662032 // "else if 2"',
      'log',
      'if4_end:',
    ]);
  });

  test('ifElseIfElseIfElse', async function () {
    const teal = await getTeal('ifElseIfElseIfElse');
    expect(teal).toEqual([
      '// if5_condition',
      '// 1',
      'int 1',
      'bz if5_elseif1_condition',
      '// if5_consequent',
      "// log('if')",
      'byte 0x6966 // "if"',
      'log',
      'b if5_end',
      'if5_elseif1_condition:',
      '// 2',
      'int 2',
      'bz if5_elseif2_condition',
      '// if5_elseif1_consequent',
      "// log('else if 1')",
      'byte 0x656c73652069662031 // "else if 1"',
      'log',
      'b if5_end',
      'if5_elseif2_condition:',
      '// 3',
      'int 3',
      'bz if5_else',
      '// if5_elseif2_consequent',
      "// log('else if 2')",
      'byte 0x656c73652069662032 // "else if 2"',
      'log',
      'b if5_end',
      'if5_else:',
      "// log('else')",
      'byte 0x656c7365 // "else"',
      'log',
      'if5_end:',
    ]);
  });
});

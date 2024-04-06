/* eslint-disable no-else-return */
/* eslint-disable no-constant-condition */
import { Contract } from '../../src/lib/index';

export class IfTest extends Contract {
  singleIf(arg0: boolean): string {
    if (arg0) {
      return 'if';
    }

    return 'end';
  }

  ifElse(arg0: boolean): string {
    if (arg0) {
      return 'if';
    } else {
      return 'else';
    }
  }

  ifElseIf(arg0: boolean, arg1: boolean): string {
    if (arg0) {
      return 'if';
    } else if (arg1) {
      return 'else if';
    }

    return 'end';
  }

  ifElseIfElse(arg0: boolean, arg1: boolean): string {
    if (arg0) {
      return 'if';
    } else if (arg1) {
      return 'else if';
    } else {
      return 'else';
    }
  }

  ifElseIfElseIf(arg0: boolean, arg1: boolean, arg2: boolean): string {
    if (arg0) {
      return 'if';
    } else if (arg1) {
      return 'else if 1';
    } else if (arg2) {
      return 'else if 2';
    }

    return 'end';
  }

  ifElseIfElseIfElse(arg0: boolean, arg1: boolean, arg2: boolean): string {
    if (arg0) {
      return 'if';
    } else if (arg1) {
      return 'else if 1';
    } else if (arg2) {
      return 'else if 2';
    } else {
      return 'else';
    }
  }

  nestedIf(arg0: boolean, arg1: boolean): string {
    if (arg0) {
      if (arg1) {
        return 'nested if';
      }
      return 'if';
    } else {
      return 'else';
    }
  }

  bracketlessIfElse(arg0: boolean): string {
    if (arg0) return 'if';
    else return 'else';
  }

  nestedTernary(arg0: boolean, arg1: boolean): uint64 {
    // eslint-disable-next-line no-nested-ternary
    return arg0 ? 1 : arg1 ? 2 : 3;
  }

  stringIf(arg0: string): uint64 {
    if (arg0) {
      return 1;
    }

    return 2;
  }

  stringTernary(arg0: string): uint64 {
    return arg0 ? 1 : 2;
  }

  smallUintConditional(a: uint16): void {
    if (a) {
      log('foo');
    }
  }

  smallUintComparisonConditional(a: uint16, b: uint16): void {
    if (a <= b) {
      log('foo');
    }
  }

  uint256ComparsionConditional(a: uint256, b: uint256): void {
    if (a <= b) {
      log('foo');
    }
  }

  nestedIfInElseIf(a: boolean, b: boolean): string {
    if (a) {
      if (b) {
        return 'a and b';
      } else {
        return 'a';
      }
    } else if (b) {
      return 'b';
    } else {
      return 'neither';
    }
  }
}

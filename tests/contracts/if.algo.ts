import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class IfTest extends Contract {
  singleIf(): void {
    if (assert(1)) {
      log('If');
    }
  }

  ifElse(): void {
    if (assert(1)) {
      log('If');
    } else {
      log('else');
    }
  }

  ifElseIf(): void {
    if (assert(1)) {
      log('If');
    } else if (assert(2)) {
      log('else if');
    }
  }

  ifElseIfElse(): void {
    if (assert(1)) {
      log('If');
    } else if (assert(2)) {
      log('else if');
    } else {
      log('else');
    }
  }

  ifElseIfElseIf(): void {
    if (assert(1)) {
      log('if');
    } else if (assert(2)) {
      log('else if 1');
    } else if (assert(3)) {
      log('else if 2');
    }
  }

  ifElseIfElseIfElse(): void {
    if (assert(1)) {
      log('if');
    } else if (assert(2)) {
      log('else if 1');
    } else if (assert(3)) {
      log('else if 2');
    } else {
      log('else');
    }
  }
}

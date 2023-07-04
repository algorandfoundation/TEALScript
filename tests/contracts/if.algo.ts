/* eslint-disable no-constant-condition */
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class IfTest extends Contract {
  singleIf(): void {
    if (1) {
      log('If');
    }
  }

  ifElse(): void {
    if (1) {
      log('If');
    } else {
      log('else');
    }
  }

  ifElseIf(): void {
    if (1) {
      log('If');
    } else if (2) {
      log('else if');
    }
  }

  ifElseIfElse(): void {
    if (1) {
      log('If');
    } else if (2) {
      log('else if');
    } else {
      log('else');
    }
  }

  ifElseIfElseIf(): void {
    if (1) {
      log('if');
    } else if (2) {
      log('else if 1');
    } else if (3) {
      log('else if 2');
    }
  }

  ifElseIfElseIfElse(): void {
    if (1) {
      log('if');
    } else if (2) {
      log('else if 1');
    } else if (3) {
      log('else if 2');
    } else {
      log('else');
    }
  }
}

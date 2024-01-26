/* eslint-disable no-continue */
import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class LoopsTest extends Contract {
  whileLoop(): uint64 {
    let i = 0;

    while (i < 10) {
      i = i + 1;
    }

    return i;
  }

  forLoop(): uint64 {
    let i = 0;

    for (let j = 0; j < 10; j = j + 1) {
      i = i + 1;
    }

    return i;
  }

  doWhileLoop(): uint64 {
    let i = 0;

    do {
      i = i + 1;
    } while (i < 10);

    return i;
  }

  breakWhileLoop(): uint64 {
    let i = 0;

    while (i < 10) {
      i = i + 1;
      if (i === 5) break;
    }

    return i;
  }

  continueWhileLoop(): uint64 {
    let i = 0;

    while (i < 10) {
      if (i === 5) {
        i = 1337;
        continue;
      }
      i = i + 1;
    }

    return i;
  }

  breakForLoop(): uint64 {
    let i = 0;

    for (let j = 0; j < 10; j = j + 1) {
      i = i + 1;
      if (i === 5) break;
    }

    return i;
  }

  continueForLoop(): uint64 {
    let i = 0;

    for (let j = 0; j < 10; j = j + 1) {
      if (i === 5) {
        i = 1337;
        continue;
      }
      i = i + 1;
    }

    return i;
  }

  breakDoWhileLoop(): uint64 {
    let i = 0;

    do {
      i = i + 1;
      if (i === 5) break;
    } while (i < 10);

    return i;
  }

  continueDoWhileLoop(): uint64 {
    let i = 0;

    do {
      if (i === 5) {
        i = 1337;
        continue;
      }
      i = i + 1;
    } while (i < 10);

    return i;
  }
}

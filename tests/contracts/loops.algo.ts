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
}

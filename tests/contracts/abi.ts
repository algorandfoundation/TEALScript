/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class AbiTest extends Contract {
  @createApplication
  create(): void {}

  staticArray(): uint64 {
    const a: Static<uint64[], 3> = [11, 22, 33];

    return a[1];
  }

  returnStaticArray(): Static<uint64[], 3> {
    const a: Static<uint64[], 3> = [11, 22, 33];

    return a;
  }

  staticArrayArg(a: Static<uint64[], 3>): uint64 {
    return a[1];
  }

  nonLiteralStaticArrayElements(): uint64 {
    const n1 = 11;
    const n2 = 22;
    const n3 = 33;
    const a: Static<uint64[], 3> = [n1, n2, n3];

    return a[1];
  }

  mixedStaticArrayElements(): uint64 {
    const n1 = 3;
    const n2 = 4;
    const n3 = 5;
    const a: Static<uint64[], 9> = [0, 1, 2, n1, n2, n3, 6, 7, 8];

    return a[1] + a[4] + a[7];
  }
}

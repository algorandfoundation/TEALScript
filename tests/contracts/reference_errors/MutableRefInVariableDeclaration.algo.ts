import { Contract } from '../../../src/lib/index';

export class MutableRefInVariableDeclaration extends Contract {
  mutableRefInVariableDeclaration() {
    const arrArr: uint64[][] = [[1, 2, 3]];

    const x = arrArr[0];

    arrArr[0][0] = 7; // <-- Error here because the canonical reference to arrArr[0] is now x

    assert(x[0] === 7);
  }
}

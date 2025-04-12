import { Contract } from '../../../src/lib/index';

export class MutableRefInVariableDeclarationWithDynamicIndex extends Contract {
  mutableRefInVariableDeclaration() {
    const arrArr: uint64[][] = [[1, 2, 3]];

    const i = 0;
    const x = arrArr[i];

    arrArr[0][0] = 7; // <-- Error here because the canonical reference to arrArr is now x (because of dynamic index)

    assert(x[0] === 7);
  }
}

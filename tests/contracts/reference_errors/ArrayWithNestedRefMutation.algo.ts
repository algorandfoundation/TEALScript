import { Contract } from '../../../src/lib/index';

export class ArrayWithNestedRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const arrWithVal: uint64[][][] = [[val]];

    // Works because nothing has been made stale yet (no mutations)
    assert(val[1] === 2);

    // Invalidate other references
    arrWithVal[0][0][0] = 4;

    // Error because now arrWithVal is stale
    assert(val[2] === 3);
  }
}

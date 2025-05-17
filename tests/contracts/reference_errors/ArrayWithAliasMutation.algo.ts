import { Contract } from '../../../src/lib/index';

export class ArrayWithAliasMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const alias = val;
    const arrWithVal: uint64[][] = [val];

    // Works because nothing has been made stale yet (no mutations)
    assert(arrWithVal[0][1] === 2);

    // Invalidate other references
    alias[0] = 5;

    // Error because now arrWithVal is stale
    assert(arrWithVal[0][2] === 3);
  }
}

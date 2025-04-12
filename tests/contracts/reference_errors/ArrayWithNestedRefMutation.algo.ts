import { Contract } from '../../../src/lib/index';

export class ArrayWithNestedRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const arrWithVal: uint64[][][] = [[val]];

    assert(val[1] === 2); // Works because nothing has been made stale yet (no mutations)

    arrWithVal[0][0][0] = 4; // Invalidate other references

    assert(val[2] === 3); // Error because now arrWithVal is stale
  }
}

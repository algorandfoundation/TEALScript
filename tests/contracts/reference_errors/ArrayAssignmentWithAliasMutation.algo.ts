import { Contract } from '../../../src/lib/index';

export class ArrayAssignmentWithAliasMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const alias: uint64[] = val;
    const arrWithVal: uint64[][] = [];

    arrWithVal[0] = val;

    assert(arrWithVal[0][1] === 2); // Works because nothing has been made stale yet (no mutations)

    alias[0] = 5; // Invalidate other references

    assert(arrWithVal[0][2] === 3); // Error because now arrWithVal is stale
  }
}

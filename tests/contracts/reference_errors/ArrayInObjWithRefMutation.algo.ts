import { Contract } from '../../../src/lib/index';

export class ArrayInObjWithRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const objWithVal: { arr: uint64[] } = { arr: val };

    assert(val[1] === 2); // Works because nothing has been made stale yet (no mutations)

    objWithVal.arr[0] = 5; // Invalidate other references

    assert(val[2] === 3); // Error because now val is stale
  }
}

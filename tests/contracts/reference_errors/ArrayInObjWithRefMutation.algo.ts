import { Contract } from '../../../src/lib/index';

export class ArrayInObjWithRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const objWithVal: { arr: uint64[] } = { arr: val };

    // Works because nothing has been made stale yet (no mutations)
    assert(val[1] === 2);

    // Invalidate other references
    objWithVal.arr[0] = 5;

    // Error because now val is stale
    assert(val[2] === 3);
  }
}

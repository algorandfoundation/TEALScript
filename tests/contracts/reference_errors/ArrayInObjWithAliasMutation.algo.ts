import { Contract } from '../../../src/lib/index';

export class ArrayInObjWithAliasMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const alias = val;
    const objWithVal: { arr: uint64[] } = { arr: val };

    // Works because nothing has been made stale yet (no mutations)
    assert(objWithVal.arr[1] === 2);

    // Invalidate other references
    alias[0] = 5;

    // Error because now objWithVal is stale
    assert(objWithVal.arr[2] === 3);
  }
}

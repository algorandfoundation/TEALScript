import { Contract } from '../../../src/lib/index';

export class ArrayInObjWithNestedRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const objWithVal: { foo: uint64[][] } = { foo: [val] };

    // Works because nothing has been made stale yet (no mutations)
    assert(val[1] === 2);

    // Invalidate other references
    objWithVal.foo[0][0] = 4;

    // Error because now objWithVal is stale
    assert(val[2] === 3);
  }
}

import { Contract } from '../../../src/lib/index';

export class ArrayInObjWithNestedRefMutation extends Contract {
  test(): void {
    const val: uint64[] = [1, 2, 3];
    const objWithVal: { foo: uint64[][] } = { foo: [val] };

    assert(val[1] === 2); // Works because nothing has been made stale yet (no mutations)

    objWithVal.foo[0][0] = 4; // Invalidate other references

    assert(val[2] === 3); // Error because now arrWithVal is stale
  }
}

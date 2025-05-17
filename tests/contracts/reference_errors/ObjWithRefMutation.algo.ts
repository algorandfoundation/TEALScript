import { Contract } from '../../../src/lib/index';

export class ObjWithRefMutation extends Contract {
  test(): void {
    const val: { foo: uint64 } = { foo: 1337 };
    const objWithVal: { bar: { foo: uint64 } } = { bar: val };

    // Works because nothing has been made stale yet (no mutations)
    assert(val.foo === 1337);

    // Invalidate other references
    objWithVal.bar.foo = 7331;

    // Error because now objWithVal is stale
    assert(val.foo === 7331);
  }
}

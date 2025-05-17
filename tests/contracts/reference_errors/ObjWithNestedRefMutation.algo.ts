import { Contract } from '../../../src/lib/index';

export class ObjWithNestedRefMutation extends Contract {
  test(): void {
    const val: { foo: uint64 } = { foo: 1337 };
    const objWithVal: { baz: { bar: { foo: uint64 } } } = { baz: { bar: val } };

    // Works because nothing has been made stale yet (no mutations)
    assert(val.foo === 1337);

    // Invalidate other references
    objWithVal.baz.bar.foo = 7331;

    // Error because now objWithVal is stale
    assert(val.foo === 7331);
  }
}

import { Contract } from '../../../src/lib/index';

export class ObjWithNestedRefMutation extends Contract {
  test(): void {
    const val: { foo: uint64 } = { foo: 1337 };
    const objWithVal: { baz: { bar: { foo: uint64 } } } = { baz: { bar: val } };

    assert(val.foo === 1337); // Works because nothing has been made stale yet (no mutations)

    objWithVal.baz.bar.foo = 7331; // Invalidate other references

    assert(val.foo === 7331); // Error because now objWithVal is stale
  }
}

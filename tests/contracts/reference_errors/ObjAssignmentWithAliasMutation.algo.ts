import { Contract } from '../../../src/lib/index';

export class ObjAssignmentWithAliasMutation extends Contract {
  test(): void {
    const val: { foo: uint64 } = { foo: 1337 };
    const alias = val;
    const objWithVal: { bar: { foo: uint64 } } = { bar: { foo: 123 } };
    objWithVal.bar = val;

    // Works because nothing has been made stale yet (no mutations)
    assert(objWithVal.bar.foo === 1337);

    // Invalidate other references
    alias.foo = 7331;

    // Error because now objWithVal is stale
    assert(objWithVal.bar.foo === 7331);
  }
}

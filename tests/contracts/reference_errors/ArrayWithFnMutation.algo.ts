import { Contract } from '../../../src/lib/index';

export class ArrayWithFnMutation extends Contract {
  someFun(arg: uint64[]) {}

  test(): void {
    const val: uint64[] = [1, 2, 3];
    const alias = val;
    const arrWithVal: uint64[][] = [val];

    assert(arrWithVal[0][1] === 2); // Works because nothing has been made stale yet (no mutations)

    this.someFun(alias); // Invalidate all references

    assert(arrWithVal[0][2] === 3); // Error because now all references are stale
  }
}

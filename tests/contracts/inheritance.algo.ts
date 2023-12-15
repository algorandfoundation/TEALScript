/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export class A extends Contract {
  fooKey = GlobalStateKey<number>({ key: 'foo' });

  createApplication(): void {
    this.fooKey.value = 1337;
  }
}

export class B extends A {
  assertFoo(): void {
    assert(this.fooKey.value === 1337);
  }
}

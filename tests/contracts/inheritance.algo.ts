/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export class A extends Contract {
  fooKey = GlobalStateKey<number>({ key: 'foo' });

  createApplication(): void {
    this.fooKey.value = 1337;
  }
}

export class B extends A {
  barKey = GlobalStateKey<number>({ key: 'bar' });

  assetFooAndSetBar(): void {
    assert(this.fooKey.value === 1337);
    this.barKey.value = 42;
  }
}

export class C extends B {
  assertFooAndBar(): void {
    assert(this.barKey.value === 42);
    assert(this.fooKey.value === 1337);
  }
}

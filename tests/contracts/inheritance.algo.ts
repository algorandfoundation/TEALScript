/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export class A extends Contract {
  aKey = GlobalStateKey<number>({ key: 'a' });

  a(): void {
    this.aKey.value = 1337;
  }
}

export class B extends A {
  bKey = GlobalStateKey<number>({ key: 'b' });

  b(): void {
    assert(this.aKey.value === 1337);
    this.bKey.value = 42;
  }
}

export class C extends B {
  c(): void {
    assert(this.bKey.value === 42);
    assert(this.aKey.value === 1337);
  }
}

export class D extends Contract {
  dKey = GlobalStateKey<number>({ key: 'd' });

  d(): void {
    this.dKey.value = 42;
  }
}

export class AD extends Contract.extend(A, D) {
  ad(): void {
    assert(this.aKey.value === 1337);
    assert(this.dKey.value === 42);
  }
}

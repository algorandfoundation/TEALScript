/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';

export class A extends Contract {
  fooKey = GlobalStateKey<number>({ key: 'foo' });

  a(): void {
    this.fooKey.value = 1337;
  }
}

export class B extends A {
  barKey = GlobalStateKey<number>({ key: 'bar' });

  b(): void {
    assert(this.fooKey.value === 1337);
    this.barKey.value = 42;
  }
}

export class C extends B {
  c(): void {
    assert(this.barKey.value === 42);
    assert(this.fooKey.value === 1337);
  }
}

export class D extends Contract {
  d(): string {
    return 'Hello World';
  }
}

export class AD extends Contract.extend(A, D) {
  ad(): string {
    assert(this.fooKey.value === 1337);
    return this.d();
  }
}

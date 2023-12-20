/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';
import { ExternalContract } from './inheritance-external.algo';

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

export class E extends ExternalContract {
  e(): void {
    assert(this.externalKey.value === 7331);
  }
}

export class F extends Contract {
  publicMethod(): string {
    return 'public';
  }

  private privateMethod(): string {
    return 'private';
  }

  protected protectedMethod(): string {
    return 'protected';
  }
}

export class G extends F {
  g(): void {
    assert(this.protectedMethod() === 'protected');
    assert(this.publicMethod() === 'public');
  }
}

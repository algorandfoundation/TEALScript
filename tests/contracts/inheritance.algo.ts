/* eslint-disable max-classes-per-file */
import { Contract } from '../../src/lib/index';
import {
  ExternalContract,
  CustomType as ExternalCustomType,
  MY_CONST as EXTERNAL_CONST,
} from './inheritance-external.algo';

type CustomType = uint256;
const MY_CONST = 456;

export class A extends Contract {
  aKey = GlobalStateKey<uint64>({ key: 'a' });

  a(): void {
    this.aKey.value = 1337;
  }
}

export class B extends A {
  bKey = GlobalStateKey<uint64>({ key: 'b' });

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
  dKey = GlobalStateKey<uint64>({ key: 'd' });

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
    const val: ExternalCustomType = <ExternalCustomType>123;
    assert(this.externalKey.value === val);
    const x = <uint256>321;
    const y = <CustomType>321;

    assert(x === y);

    assert(MY_CONST === 456);
    assert(EXTERNAL_CONST === 654);
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

export class B2 extends A {
  b2(): void {
    log('b2');
  }
}

export class MultiInheritance extends Contract.extend(B, B2) {
  foo(): void {
    log(B2.approvalProgram());
  }
}

export class MultiInheritanceProgram extends Contract {
  prog(): void {
    log(MultiInheritance.approvalProgram());
  }
}

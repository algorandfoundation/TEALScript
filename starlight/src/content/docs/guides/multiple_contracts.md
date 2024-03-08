---
title: Multiple Contracts
---

## Inheritance

You can inherit another Contract or LogicSig in order to inherit all of the class properties (state, events, scratch, etc.) and methods.

```ts
export class BaseContract extends Contract {
    favoriteNumber = GlobalStateKey<uint64>()
    
    private setNumber(n: uint64): void {
        this.favoriteNumber.value = n
    }
}

export class AnotherContract extends BaseContract {
    checkNumber(): void {
        this.setNumber(42)
        assert(this.favoriteNumber.value === 42)
    }
}
```

## Importing and Inheritance

TEALScript supports importing any `Contract`, `LogicSig`, const, or type from another TEALScript file. 

```ts
// base_contract.algo.ts
export class BaseContract extends Contract {
    favoriteNumber = GlobalStateKey<uint64>()
    
    private setNumber(n: uint64): void {
        this.favoriteNumber.value = n
    }
}
```

```ts
// another_contract.algo.ts
import { BaseContract } from './base_contract.algo.ts'

export class AnotherContract extends BaseContract {
    checkNumber(): void {
        this.setNumber(42)
        assert(this.favoriteNumber.value === 42)
    }
}
```

## App Programs and Schema

To access the program or schema of another TEALScript app you can use the `.approvalProgram()`. `.clearProgram()`, or `.schema` static methods.

```ts
class TheApp extends Contract {
  favoriteNumber = GlobalStateKey<uint64>();

  createApplication(): void {
    this.favoriteNumber.value = 42;
  }
}

class TheFactory extends Contract {
  createTheApp(): void {
    sendMethodCall<[], void>({
      name: 'createApplication',
      approvalProgram: TheApp.approvalProgram(),
      clearStateProgram: TheApp.clearProgram(),
      globalNumUint: TheApp.schema.global.numUint,
    });
  }
}
```

## Logic Signature Address and Program

```ts
class TheLsig extends LogicSig {
  logic(): void {
    assert(this.txn.fee === 0);
  }
}
class TheApp extends Contract {
  createApplication(): void {
    assert(TheLsig.address().balance >= 10_000_000);
    log(TheLsig.program());
  }
}
```
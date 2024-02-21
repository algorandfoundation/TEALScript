---
editUrl: false
next: false
prev: false
title: "AppParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### accounts?

> **`optional`** **accounts**: [`Address`](../classes/Address.md)[]

#### Source

[types/global.d.ts:746](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L746)

***

### applicationArgs?

> **`optional`** **applicationArgs**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

#### Source

[types/global.d.ts:748](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L748)

***

### applicationID?

> **`optional`** **applicationID**: [`Application`](../classes/Application.md)

#### Source

[types/global.d.ts:744](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L744)

***

### applications?

> **`optional`** **applications**: [`Application`](../classes/Application.md)[]

#### Source

[types/global.d.ts:750](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L750)

***

### approvalProgram?

> **`optional`** **approvalProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:747](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L747)

***

### assets?

> **`optional`** **assets**: [`Asset`](../classes/Asset.md)[]

#### Source

[types/global.d.ts:751](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L751)

***

### clearStateProgram?

> **`optional`** **clearStateProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[types/global.d.ts:749](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L749)

***

### extraProgramPages?

> **`optional`** **extraProgramPages**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:756](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L756)

***

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`fee`](CommonTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L633)

***

### globalNumByteSlice?

> **`optional`** **globalNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:752](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L752)

***

### globalNumUint?

> **`optional`** **globalNumUint**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:753](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L753)

***

### localNumByteSlice?

> **`optional`** **localNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:754](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L754)

***

### localNumUint?

> **`optional`** **localNumUint**: [`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:755](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L755)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`note`](CommonTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L639)

***

### onCompletion?

> **`optional`** **onCompletion**: [`OnCompletion`](../enumerations/OnCompletion.md)

#### Source

[types/global.d.ts:745](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L745)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`rekeyTo`](CommonTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

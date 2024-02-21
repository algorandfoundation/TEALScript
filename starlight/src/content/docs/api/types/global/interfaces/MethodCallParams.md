---
editUrl: false
next: false
prev: false
title: "MethodCallParams"
---

## Extends

- [`AppParams`](AppParams.md)

## Type parameters

• **ArgsType**

## Properties

### accounts?

> **`optional`** **accounts**: [`Address`](../classes/Address.md)[]

#### Inherited from

[`AppParams`](AppParams.md).[`accounts`](AppParams.md#accounts)

#### Source

[types/global.d.ts:746](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L746)

***

### applicationArgs?

> **`optional`** **applicationArgs**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>[]

#### Inherited from

[`AppParams`](AppParams.md).[`applicationArgs`](AppParams.md#applicationargs)

#### Source

[types/global.d.ts:748](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L748)

***

### applicationID?

> **`optional`** **applicationID**: [`Application`](../classes/Application.md)

#### Inherited from

[`AppParams`](AppParams.md).[`applicationID`](AppParams.md#applicationid)

#### Source

[types/global.d.ts:744](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L744)

***

### applications?

> **`optional`** **applications**: [`Application`](../classes/Application.md)[]

#### Inherited from

[`AppParams`](AppParams.md).[`applications`](AppParams.md#applications)

#### Source

[types/global.d.ts:750](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L750)

***

### approvalProgram?

> **`optional`** **approvalProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Inherited from

[`AppParams`](AppParams.md).[`approvalProgram`](AppParams.md#approvalprogram)

#### Source

[types/global.d.ts:747](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L747)

***

### assets?

> **`optional`** **assets**: [`Asset`](../classes/Asset.md)[]

#### Inherited from

[`AppParams`](AppParams.md).[`assets`](AppParams.md#assets)

#### Source

[types/global.d.ts:751](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L751)

***

### clearStateProgram?

> **`optional`** **clearStateProgram**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Inherited from

[`AppParams`](AppParams.md).[`clearStateProgram`](AppParams.md#clearstateprogram)

#### Source

[types/global.d.ts:749](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L749)

***

### extraProgramPages?

> **`optional`** **extraProgramPages**: [`uint64`](../type-aliases/uint64.md)

#### Inherited from

[`AppParams`](AppParams.md).[`extraProgramPages`](AppParams.md#extraprogrampages)

#### Source

[types/global.d.ts:756](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L756)

***

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`AppParams`](AppParams.md).[`fee`](AppParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L633)

***

### globalNumByteSlice?

> **`optional`** **globalNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

#### Inherited from

[`AppParams`](AppParams.md).[`globalNumByteSlice`](AppParams.md#globalnumbyteslice)

#### Source

[types/global.d.ts:752](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L752)

***

### globalNumUint?

> **`optional`** **globalNumUint**: [`uint64`](../type-aliases/uint64.md)

#### Inherited from

[`AppParams`](AppParams.md).[`globalNumUint`](AppParams.md#globalnumuint)

#### Source

[types/global.d.ts:753](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L753)

***

### localNumByteSlice?

> **`optional`** **localNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

#### Inherited from

[`AppParams`](AppParams.md).[`localNumByteSlice`](AppParams.md#localnumbyteslice)

#### Source

[types/global.d.ts:754](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L754)

***

### localNumUint?

> **`optional`** **localNumUint**: [`uint64`](../type-aliases/uint64.md)

#### Inherited from

[`AppParams`](AppParams.md).[`localNumUint`](AppParams.md#localnumuint)

#### Source

[types/global.d.ts:755](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L755)

***

### methodArgs?

> **`optional`** **methodArgs**: `ArgsType`

ABI method arguments

#### Source

[types/global.d.ts:786](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L786)

***

### name

> **name**: `string`

Name of the ABI method

#### Source

[types/global.d.ts:788](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L788)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`AppParams`](AppParams.md).[`note`](AppParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L639)

***

### onCompletion?

> **`optional`** **onCompletion**: [`OnCompletion`](../enumerations/OnCompletion.md)

#### Inherited from

[`AppParams`](AppParams.md).[`onCompletion`](AppParams.md#oncompletion)

#### Source

[types/global.d.ts:745](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L745)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`AppParams`](AppParams.md).[`rekeyTo`](AppParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`AppParams`](AppParams.md).[`sender`](AppParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L635)

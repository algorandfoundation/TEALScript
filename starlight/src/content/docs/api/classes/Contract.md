---
editUrl: false
next: false
prev: false
title: "Contract"
---

## Constructors

### new Contract()

> **new Contract**(): [`Contract`](Contract.md)

#### Returns

[`Contract`](Contract.md)

## Properties

### app

> **app**: [`Application`](Application.md)

#### Source

[src/lib/contract.ts:80](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L80)

***

### itxn

> **itxn**: `ItxnParams`

#### Source

[src/lib/contract.ts:71](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L71)

***

### lastInnerGroup

> **lastInnerGroup**: [`Txn`](../type-aliases/Txn.md)[]

Provides access to the transactions in the most recent inner transaction group send via `pendingGroup`

#### Source

[src/lib/contract.ts:78](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L78)

***

### pendingGroup

> **pendingGroup**: [`PendingGroup`](PendingGroup.md)

#### Source

[src/lib/contract.ts:82](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L82)

***

### programVersion

> **programVersion**: `number` = `9`

The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive

#### Source

[src/lib/contract.ts:69](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L69)

***

### txn

> **txn**: [`ThisTxnParams`](../type-aliases/ThisTxnParams.md)

#### Source

[src/lib/contract.ts:73](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L73)

***

### txnGroup

> **txnGroup**: [`Txn`](../type-aliases/Txn.md)[]

#### Source

[src/lib/contract.ts:75](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L75)

***

### approvalProgram

> **`static`** **approvalProgram**: () => [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Returns

[`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[src/lib/contract.ts:53](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L53)

***

### clearProgram

> **`static`** **clearProgram**: () => [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Returns

[`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[src/lib/contract.ts:55](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L55)

***

### extend

> **`static`** **extend**: \<`T`\>(...`types`) => `Polytype.ClusteredConstructor`\<`T`\>

Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.

#### Type parameters

• **T** extends `NonEmptyArray`\<`SuperConstructor`\>

#### Parameters

• ...**types**: `T`

#### Returns

`Polytype.ClusteredConstructor`\<`T`\>

#### Source

[src/lib/contract.ts:51](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L51)

***

### schema

> **`static`** **schema**: `Object`

#### schema.global

> **global**: `Object`

#### schema.global.numByteSlice

> **numByteSlice**: `number`

#### schema.global.numUint

> **numUint**: `number`

#### schema.local

> **local**: `Object`

#### schema.local.numByteSlice

> **numByteSlice**: `number`

#### schema.local.numUint

> **numUint**: `number`

#### Source

[src/lib/contract.ts:57](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L57)

## Methods

### clearState()

> **clearState**(): `void`

The method called when an account clears their local state. The default ClearState
method does nothing. ClearState will always allow a user to delete their local state,
reagrdless of logic.

#### Returns

`void`

#### Source

[src/lib/contract.ts:132](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L132)

***

### closeOutOfApplication()

> **closeOutOfApplication**(...`args`): `void`

The method called when an account closes out their local state. The default close-out method
will always throw an error

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/contract.ts:123](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L123)

***

### createApplication()

> **createApplication**(...`args`): `void`

The method called when creating the application. The default create method will
allow the contract to be created via a bare NoOp appcall and throw an error if called
with any arguments.

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/contract.ts:89](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L89)

***

### deleteApplication()

> **deleteApplication**(...`args`): `void`

The method called when attempting to delete the application. The default delete method will
always throw an error

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/contract.ts:107](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L107)

***

### optInToApplication()

> **optInToApplication**(...`args`): `void`

The method called when an account opts-in to the application. The default opt-in method will
always throw an error

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/contract.ts:115](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L115)

***

### updateApplication()

> **updateApplication**(...`args`): `void`

The method called when attempting to update the application. The default update method will
always throw an error

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/contract.ts:99](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/contract.ts#L99)

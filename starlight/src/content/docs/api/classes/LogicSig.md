---
editUrl: false
next: false
prev: false
title: "LogicSig"
---

## Constructors

### new LogicSig()

> **new LogicSig**(): [`LogicSig`](LogicSig.md)

#### Returns

[`LogicSig`](LogicSig.md)

## Properties

### programVersion

> **programVersion**: `number` = `9`

The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive

#### Source

[src/lib/lsig.ts:24](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L24)

***

### txn

> **txn**: [`Txn`](../type-aliases/Txn.md)

#### Source

[src/lib/lsig.ts:19](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L19)

***

### txnGroup

> **txnGroup**: [`Txn`](../type-aliases/Txn.md)[]

#### Source

[src/lib/lsig.ts:21](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L21)

***

### address

> **`static`** **address**: () => [`Address`](Address.md)

#### Returns

[`Address`](Address.md)

#### Source

[src/lib/lsig.ts:15](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L15)

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

[src/lib/lsig.ts:13](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L13)

***

### program

> **`static`** **program**: () => [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Returns

[`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

#### Source

[src/lib/lsig.ts:17](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L17)

## Methods

### logic()

> **`abstract`** **logic**(...`args`): `void`

#### Parameters

• ...**args**: `any`[]

#### Returns

`void`

#### Source

[src/lib/lsig.ts:26](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/src/lib/lsig.ts#L26)

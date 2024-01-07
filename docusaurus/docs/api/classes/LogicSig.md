---
id: "LogicSig"
title: "Class: LogicSig"
sidebar_label: "LogicSig"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new LogicSig**(): [`LogicSig`](LogicSig.md)

#### Returns

[`LogicSig`](LogicSig.md)

## Properties

### programVersion

• **programVersion**: `number` = `9`

The program version to use in the generated TEAL. This is the number used in the "#pragma version" directive

#### Defined in

[src/lib/lsig.ts:24](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L24)

___

### txn

• **txn**: [`Txn`](../modules.md#txn)

#### Defined in

[src/lib/lsig.ts:19](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L19)

___

### txnGroup

• **txnGroup**: [`Txn`](../modules.md#txn)[]

#### Defined in

[src/lib/lsig.ts:21](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L21)

___

### address

▪ `Static` **address**: () => [`Address`](Address.md)

#### Type declaration

▸ (): [`Address`](Address.md)

##### Returns

[`Address`](Address.md)

#### Defined in

[src/lib/lsig.ts:15](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L15)

___

### extend

▪ `Static` **extend**: \<T\>(...`types`: `T`) => `Polytype.ClusteredConstructor`\<`T`\>

Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.

#### Type declaration

▸ \<`T`\>(`...types`): `Polytype.ClusteredConstructor`\<`T`\>

Create a contract class that inherits from the given contracts. Inheritance is in order of arguments.

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`SuperConstructor`, ...SuperConstructor[]] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `...types` | `T` |

##### Returns

`Polytype.ClusteredConstructor`\<`T`\>

#### Defined in

[src/lib/lsig.ts:13](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L13)

___

### program

▪ `Static` **program**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/lsig.ts:17](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L17)

## Methods

### logic

▸ **logic**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/lsig.ts:26](https://github.com/algorandfoundation/tealscript/blob/d1eab388/src/lib/lsig.ts#L26)

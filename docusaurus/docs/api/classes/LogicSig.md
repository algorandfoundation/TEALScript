---
id: "LogicSig"
title: "Class: LogicSig"
sidebar_label: "LogicSig"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new LogicSig**()

## Properties

### txn

• **txn**: [`Txn`](../modules.md#txn)

#### Defined in

[src/lib/lsig.ts:13](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/lsig.ts#L13)

___

### txnGroup

• **txnGroup**: [`Txn`](../modules.md#txn)[]

#### Defined in

[src/lib/lsig.ts:15](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/lsig.ts#L15)

___

### address

▪ `Static` **address**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/lsig.ts:9](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/lsig.ts#L9)

___

### program

▪ `Static` **program**: () => [`bytes`](../modules.md#bytes)

#### Type declaration

▸ (): [`bytes`](../modules.md#bytes)

##### Returns

[`bytes`](../modules.md#bytes)

#### Defined in

[src/lib/lsig.ts:11](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/lsig.ts#L11)

## Methods

### logic

▸ `Abstract` **logic**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

#### Returns

`void`

#### Defined in

[src/lib/lsig.ts:17](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/src/lib/lsig.ts#L17)

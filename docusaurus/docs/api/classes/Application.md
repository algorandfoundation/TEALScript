---
id: "Application"
title: "Class: Application"
sidebar_label: "Application"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Application**()

## Properties

### address

• `Readonly` **address**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:430](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L430)

___

### approvalProgram

• `Readonly` **approvalProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:414](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L414)

___

### clearStateProgram

• `Readonly` **clearStateProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:416](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L416)

___

### creator

• `Readonly` **creator**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:428](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L428)

___

### extraProgramPages

• `Readonly` **extraProgramPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:426](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L426)

___

### globalNumByteSlice

• `Readonly` **globalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:420](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L420)

___

### globalNumUint

• `Readonly` **globalNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:418](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L418)

___

### localNumByteSlice

• `Readonly` **localNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:424](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L424)

___

### localNumUint

• `Readonly` **localNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:422](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L422)

___

### zeroIndex

▪ `Static` `Readonly` **zeroIndex**: [`Application`](Application.md)

#### Defined in

[types/global.d.ts:412](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L412)

## Methods

### global

▸ **global**(`key`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

`any`

#### Defined in

[types/global.d.ts:433](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L433)

___

### fromID

▸ `Static` **fromID**(`appID`): [`Application`](Application.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `appID` | [`uint64`](../modules.md#uint64) |

#### Returns

[`Application`](Application.md)

#### Defined in

[types/global.d.ts:410](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L410)

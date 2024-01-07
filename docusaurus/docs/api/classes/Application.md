---
id: "Application"
title: "Class: Application"
sidebar_label: "Application"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Application**(): [`Application`](Application.md)

#### Returns

[`Application`](Application.md)

## Properties

### address

• `Readonly` **address**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:451](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L451)

___

### approvalProgram

• `Readonly` **approvalProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:435](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L435)

___

### clearStateProgram

• `Readonly` **clearStateProgram**: [`bytes`](../modules.md#bytes)

#### Defined in

[types/global.d.ts:437](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L437)

___

### creator

• `Readonly` **creator**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:449](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L449)

___

### extraProgramPages

• `Readonly` **extraProgramPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:447](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L447)

___

### globalNumByteSlice

• `Readonly` **globalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:441](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L441)

___

### globalNumUint

• `Readonly` **globalNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:439](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L439)

___

### id

• `Readonly` **id**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:431](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L431)

___

### localNumByteSlice

• `Readonly` **localNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:445](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L445)

___

### localNumUint

• `Readonly` **localNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:443](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L443)

___

### zeroIndex

▪ `Static` `Readonly` **zeroIndex**: [`Application`](Application.md)

#### Defined in

[types/global.d.ts:433](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L433)

## Methods

### globalState

▸ **globalState**(`key`): `unknown`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

`unknown`

#### Defined in

[types/global.d.ts:453](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L453)

___

### localState

▸ **localState**(`account`, `key`): `unknown`

#### Parameters

| Name | Type |
| :------ | :------ |
| `account` | [`Address`](Address.md) |
| `key` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

`unknown`

#### Defined in

[types/global.d.ts:455](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L455)

___

### fromID

▸ **fromID**(`appID`): [`Application`](Application.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `appID` | [`uint64`](../modules.md#uint64) |

#### Returns

[`Application`](Application.md)

#### Defined in

[types/global.d.ts:429](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L429)

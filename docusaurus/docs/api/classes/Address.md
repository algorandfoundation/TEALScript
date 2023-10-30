---
id: "Address"
title: "Class: Address"
sidebar_label: "Address"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new Address**()

## Properties

### authAddr

• `Readonly` **authAddr**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:375](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L375)

___

### balance

• `Readonly` **balance**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:366](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L366)

___

### hasBalance

• `Readonly` **hasBalance**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:368](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L368)

___

### minBalance

• `Readonly` **minBalance**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:370](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L370)

___

### totalAppsCreated

• `Readonly` **totalAppsCreated**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:383](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L383)

___

### totalAppsOptedIn

• `Readonly` **totalAppsOptedIn**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:385](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L385)

___

### totalAssets

• `Readonly` **totalAssets**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:372](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L372)

___

### totalAssetsCreated

• `Readonly` **totalAssetsCreated**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:387](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L387)

___

### totalBoxBytes

• `Readonly` **totalBoxBytes**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:391](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L391)

___

### totalBoxes

• `Readonly` **totalBoxes**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:389](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L389)

___

### totalExtraAppPages

• `Readonly` **totalExtraAppPages**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:381](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L381)

___

### totalNumByteSlice

• `Readonly` **totalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:379](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L379)

___

### totalNumUint

• `Readonly` **totalNumUint**: [`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:377](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L377)

___

### zeroAddress

▪ `Static` `Readonly` **zeroAddress**: [`Address`](Address.md)

#### Defined in

[types/global.d.ts:364](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L364)

## Methods

### assetBalance

▸ **assetBalance**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:393](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L393)

___

### assetFrozen

▸ **assetFrozen**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:397](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L397)

___

### hasAsset

▸ **hasAsset**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Defined in

[types/global.d.ts:395](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L395)

___

### isOptedInToApp

▸ **isOptedInToApp**(`app`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `app` | [`Application`](Application.md) |

#### Returns

`boolean`

#### Defined in

[types/global.d.ts:399](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L399)

___

### state

▸ **state**(`app`, `key`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `app` | [`Application`](Application.md) |
| `key` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

`any`

#### Defined in

[types/global.d.ts:402](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L402)

___

### fromBytes

▸ `Static` **fromBytes**(`addr`): [`Address`](Address.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `addr` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

[`Address`](Address.md)

#### Defined in

[types/global.d.ts:362](https://github.com/algorandfoundation/tealscript/blob/ca0f445c/types/global.d.ts#L362)

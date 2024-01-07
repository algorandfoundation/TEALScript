---
id: "Account"
title: "Class: Account"
sidebar_label: "Account"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`Address`](Address.md)

  ↳ **`Account`**

## Constructors

### constructor

• **new Account**(): [`Account`](Account.md)

#### Returns

[`Account`](Account.md)

#### Inherited from

[Address](Address.md).[constructor](Address.md#constructor)

## Properties

### authAddr

• `Readonly` **authAddr**: [`Address`](Address.md)

#### Inherited from

[Address](Address.md).[authAddr](Address.md#authaddr)

#### Defined in

[types/global.d.ts:397](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L397)

___

### balance

• `Readonly` **balance**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[balance](Address.md#balance)

#### Defined in

[types/global.d.ts:388](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L388)

___

### hasBalance

• `Readonly` **hasBalance**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[hasBalance](Address.md#hasbalance)

#### Defined in

[types/global.d.ts:390](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L390)

___

### minBalance

• `Readonly` **minBalance**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[minBalance](Address.md#minbalance)

#### Defined in

[types/global.d.ts:392](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L392)

___

### totalAppsCreated

• `Readonly` **totalAppsCreated**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalAppsCreated](Address.md#totalappscreated)

#### Defined in

[types/global.d.ts:405](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L405)

___

### totalAppsOptedIn

• `Readonly` **totalAppsOptedIn**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalAppsOptedIn](Address.md#totalappsoptedin)

#### Defined in

[types/global.d.ts:407](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L407)

___

### totalAssets

• `Readonly` **totalAssets**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalAssets](Address.md#totalassets)

#### Defined in

[types/global.d.ts:394](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L394)

___

### totalAssetsCreated

• `Readonly` **totalAssetsCreated**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalAssetsCreated](Address.md#totalassetscreated)

#### Defined in

[types/global.d.ts:409](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L409)

___

### totalBoxBytes

• `Readonly` **totalBoxBytes**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalBoxBytes](Address.md#totalboxbytes)

#### Defined in

[types/global.d.ts:413](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L413)

___

### totalBoxes

• `Readonly` **totalBoxes**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalBoxes](Address.md#totalboxes)

#### Defined in

[types/global.d.ts:411](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L411)

___

### totalExtraAppPages

• `Readonly` **totalExtraAppPages**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalExtraAppPages](Address.md#totalextraapppages)

#### Defined in

[types/global.d.ts:403](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L403)

___

### totalNumByteSlice

• `Readonly` **totalNumByteSlice**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalNumByteSlice](Address.md#totalnumbyteslice)

#### Defined in

[types/global.d.ts:401](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L401)

___

### totalNumUint

• `Readonly` **totalNumUint**: [`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[totalNumUint](Address.md#totalnumuint)

#### Defined in

[types/global.d.ts:399](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L399)

___

### zeroAddress

▪ `Static` `Readonly` **zeroAddress**: [`Address`](Address.md)

#### Inherited from

[Address](Address.md).[zeroAddress](Address.md#zeroaddress)

#### Defined in

[types/global.d.ts:386](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L386)

## Methods

### assetBalance

▸ **assetBalance**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[assetBalance](Address.md#assetbalance)

#### Defined in

[types/global.d.ts:415](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L415)

___

### assetFrozen

▸ **assetFrozen**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[assetFrozen](Address.md#assetfrozen)

#### Defined in

[types/global.d.ts:419](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L419)

___

### hasAsset

▸ **hasAsset**(`asa`): [`uint64`](../modules.md#uint64)

#### Parameters

| Name | Type |
| :------ | :------ |
| `asa` | [`Asset`](Asset.md) |

#### Returns

[`uint64`](../modules.md#uint64)

#### Inherited from

[Address](Address.md).[hasAsset](Address.md#hasasset)

#### Defined in

[types/global.d.ts:417](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L417)

___

### isOptedInToApp

▸ **isOptedInToApp**(`app`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `app` | [`Application`](Application.md) |

#### Returns

`boolean`

#### Inherited from

[Address](Address.md).[isOptedInToApp](Address.md#isoptedintoapp)

#### Defined in

[types/global.d.ts:421](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L421)

___

### fromBytes

▸ **fromBytes**(`addr`): [`Address`](Address.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `addr` | [`BytesLike`](../modules.md#byteslike) |

#### Returns

[`Address`](Address.md)

#### Inherited from

[Address](Address.md).[fromBytes](Address.md#frombytes)

#### Defined in

[types/global.d.ts:384](https://github.com/algorandfoundation/tealscript/blob/d1eab388/types/global.d.ts#L384)

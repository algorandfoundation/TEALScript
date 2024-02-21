---
editUrl: false
next: false
prev: false
title: "Address"
---

An Algorand address

## Extended by

- [`Account`](Account.md)

## Constructors

### new Address()

> **new Address**(): [`Address`](Address.md)

#### Returns

[`Address`](Address.md)

## Properties

### authAddr

> **`readonly`** **authAddr**: [`Address`](Address.md)

Signifies the public key for the keypair that has authority over this address

#### Source

[types/global.d.ts:450](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L450)

***

### balance

> **`readonly`** **balance**: [`uint64`](../type-aliases/uint64.md)

The accounts current balance (in µALGO)

#### Source

[types/global.d.ts:437](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L437)

***

### isInLedger

> **`readonly`** **isInLedger**: [`uint64`](../type-aliases/uint64.md)

Whether the account is in the ledger or not

#### Source

[types/global.d.ts:440](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L440)

***

### minBalance

> **`readonly`** **minBalance**: [`uint64`](../type-aliases/uint64.md)

The account's current minimum balance require (MBR) (in µALGO)

#### Source

[types/global.d.ts:443](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L443)

***

### totalAppsCreated

> **`readonly`** **totalAppsCreated**: [`uint64`](../type-aliases/uint64.md)

The total number of apps created by this address

#### Source

[types/global.d.ts:462](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L462)

***

### totalAppsOptedIn

> **`readonly`** **totalAppsOptedIn**: [`uint64`](../type-aliases/uint64.md)

The total number of apps opted in to by this address

#### Source

[types/global.d.ts:465](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L465)

***

### totalAssets

> **`readonly`** **totalAssets**: [`uint64`](../type-aliases/uint64.md)

The number of assets this address is opted in to

#### Source

[types/global.d.ts:446](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L446)

***

### totalAssetsCreated

> **`readonly`** **totalAssetsCreated**: [`uint64`](../type-aliases/uint64.md)

The total number of assets created by this address

#### Source

[types/global.d.ts:468](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L468)

***

### totalBoxBytes

> **`readonly`** **totalBoxBytes**: [`uint64`](../type-aliases/uint64.md)

The total number of box bytes funded by this address. Only applies to application addreses.

#### Source

[types/global.d.ts:474](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L474)

***

### totalBoxes

> **`readonly`** **totalBoxes**: [`uint64`](../type-aliases/uint64.md)

The total number of boxes funded by this address. Only applies to application addreses.

#### Source

[types/global.d.ts:471](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L471)

***

### totalExtraAppPages

> **`readonly`** **totalExtraAppPages**: [`uint64`](../type-aliases/uint64.md)

The total number of extra application pages reserved across all apps

#### Source

[types/global.d.ts:459](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L459)

***

### totalNumByteSlice

> **`readonly`** **totalNumByteSlice**: [`uint64`](../type-aliases/uint64.md)

The total number of byte slices reserved in global and local state across all apps

#### Source

[types/global.d.ts:456](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L456)

***

### totalNumUint

> **`readonly`** **totalNumUint**: [`uint64`](../type-aliases/uint64.md)

The total number of uint64 values reserved in global and local state across all apps

#### Source

[types/global.d.ts:453](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L453)

***

### zeroAddress

> **`static`** **`readonly`** **zeroAddress**: [`Address`](Address.md)

The zero address: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ`

#### Source

[types/global.d.ts:434](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L434)

## Methods

### assetBalance()

> **assetBalance**(`asa`): [`uint64`](../type-aliases/uint64.md)

The balance of the given asset for this address

#### Parameters

• **asa**: [`Asset`](Asset.md)

#### Returns

[`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:477](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L477)

***

### assetFrozen()

> **assetFrozen**(`asa`): [`uint64`](../type-aliases/uint64.md)

Whether the given asset is frozen in this address

#### Parameters

• **asa**: [`Asset`](Asset.md)

#### Returns

[`uint64`](../type-aliases/uint64.md)

#### Source

[types/global.d.ts:483](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L483)

***

### isOptedInToApp()

> **isOptedInToApp**(`app`): `boolean`

Whether this address is opted into the given application

#### Parameters

• **app**: [`Application`](Application.md)

#### Returns

`boolean`

#### Source

[types/global.d.ts:486](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L486)

***

### isOptedInToAsset()

> **isOptedInToAsset**(`asa`): `boolean`

Whether this address is opted into the given address

#### Parameters

• **asa**: [`Asset`](Asset.md)

#### Returns

`boolean`

#### Source

[types/global.d.ts:480](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L480)

***

### fromBytes()

> **`static`** **fromBytes**(`addr`): [`Address`](Address.md)

Create an `Address` instance from the given public key

#### Parameters

• **addr**: [`BytesLike`](../type-aliases/BytesLike.md)

#### Returns

[`Address`](Address.md)

#### Source

[types/global.d.ts:431](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L431)

---
editUrl: false
next: false
prev: false
title: "Asset"
---

An Algorand Standard Asset (ASA). `asset` ABI type when used as an argument or return type in a method, `uint64` when in an array or state.

## Constructors

### new Asset()

> **new Asset**(): [`Asset`](Asset.md)

#### Returns

[`Asset`](Asset.md)

## Properties

### clawback

> **`readonly`** **clawback**: [`Address`](Address.md)

The clawback account that can take assets from any account

#### Source

[types/global.d.ts:422](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L422)

***

### creator

> **`readonly`** **creator**: [`Address`](Address.md)

The creator of the asset

#### Source

[types/global.d.ts:425](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L425)

***

### decimals

> **`readonly`** **decimals**: [`uint64`](../type-aliases/uint64.md)

The number of decimal places to use when displaying the asset

#### Source

[types/global.d.ts:395](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L395)

***

### defaultFrozen

> **`readonly`** **defaultFrozen**: `boolean`

Whether the asset is frozen by default when created

#### Source

[types/global.d.ts:398](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L398)

***

### freeze

> **`readonly`** **freeze**: [`Address`](Address.md)

The freeze account that can freeze or unfreeze other accounts holdings the asset

#### Source

[types/global.d.ts:419](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L419)

***

### id

> **`readonly`** **id**: [`uint64`](../type-aliases/uint64.md)

The asset index

#### Source

[types/global.d.ts:389](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L389)

***

### manager

> **`readonly`** **manager**: [`Address`](Address.md)

The manager that can update the maanger, freeze, and reserve accounts

#### Source

[types/global.d.ts:413](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L413)

***

### metadataHash

> **`readonly`** **metadataHash**: [`StaticBytes`](../type-aliases/StaticBytes.md)\<`32`\>

The hash of the assets metadata

#### Source

[types/global.d.ts:410](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L410)

***

### name

> **`readonly`** **name**: `string`

The name of the asset. Must be 32 bytes or less.

#### Source

[types/global.d.ts:401](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L401)

***

### reserve

> **`readonly`** **reserve**: [`Address`](Address.md)

The reserve account that holds the assets that are not in circulation

#### Source

[types/global.d.ts:416](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L416)

***

### total

> **`readonly`** **total**: [`uint64`](../type-aliases/uint64.md)

The total number of units of the asset

#### Source

[types/global.d.ts:392](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L392)

***

### unitName

> **`readonly`** **unitName**: `string`

The short (ticker) name of the asset (ie. USDC)

#### Source

[types/global.d.ts:404](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L404)

***

### url

> **`readonly`** **url**: `string`

The URL of the assets metadata

#### Source

[types/global.d.ts:407](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L407)

***

### zeroIndex

> **`static`** **`readonly`** **zeroIndex**: [`Asset`](Asset.md)

Asset index 0. Only useful for input validation.

#### Source

[types/global.d.ts:386](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L386)

## Methods

### fromID()

> **`static`** **fromID**(`index`): [`Asset`](Asset.md)

Get an `Asset` instance for the ASA with the given asset index

#### Parameters

• **index**: [`uint64`](../type-aliases/uint64.md)

#### Returns

[`Asset`](Asset.md)

#### Source

[types/global.d.ts:383](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L383)

---
editUrl: false
next: false
prev: false
title: "sendAssetConfig"
---

> **sendAssetConfig**(`params`): `void`

## Parameters

• **params**

• **params\.configAsset**: [`Asset`](../classes/Asset.md)

• **params\.configAssetClawback?**: [`Address`](../classes/Address.md)

• **params\.configAssetFreeze?**: [`Address`](../classes/Address.md)

• **params\.configAssetManager?**: [`Address`](../classes/Address.md)

• **params\.configAssetReserve?**: [`Address`](../classes/Address.md)

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`void`

## Source

[types/global.d.ts:860](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L860)

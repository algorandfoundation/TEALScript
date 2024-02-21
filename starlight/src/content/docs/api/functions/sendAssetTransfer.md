---
editUrl: false
next: false
prev: false
title: "sendAssetTransfer"
---

> **sendAssetTransfer**(`params`): `void`

## Parameters

• **params**

• **params\.assetAmount**: [`uint64`](../type-aliases/uint64.md)

The amount of the asset being transferred

• **params\.assetCloseTo?**: [`Address`](../classes/Address.md)

The address to close the asset to

• **params\.assetReceiver**: [`Address`](../classes/Address.md)

The receiver of the asset

• **params\.assetSender?**: [`Address`](../classes/Address.md)

The clawback target

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.xferAsset**: [`Asset`](../classes/Asset.md)

The asset being transfed

## Returns

`void`

## Source

[types/global.d.ts:856](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L856)

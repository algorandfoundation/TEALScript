---
editUrl: false
next: false
prev: false
title: "sendAssetFreeze"
---

> **sendAssetFreeze**(`params`): `void`

## Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.freezeAsset**: [`Asset`](../classes/Asset.md)

• **params\.freezeAssetAccount**: [`Address`](../classes/Address.md)

• **params\.freezeAssetFrozen**: `boolean`

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`void`

## Source

[types/global.d.ts:861](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L861)

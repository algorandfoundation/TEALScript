---
editUrl: false
next: false
prev: false
title: "sendAssetCreation"
---

> **sendAssetCreation**(`params`): [`Asset`](../classes/Asset.md)

## Parameters

• **params**

• **params\.configAssetClawback?**: [`Address`](../classes/Address.md)

• **params\.configAssetDecimals?**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetDefaultFrozen?**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetFreeze?**: [`Address`](../classes/Address.md)

• **params\.configAssetManager?**: [`Address`](../classes/Address.md)

• **params\.configAssetMetadataHash?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetName?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetReserve?**: [`Address`](../classes/Address.md)

• **params\.configAssetTotal**: [`uint64`](../type-aliases/uint64.md)

• **params\.configAssetURL?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.configAssetUnitName?**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

[`Asset`](../classes/Asset.md)

## Source

[types/global.d.ts:857](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L857)

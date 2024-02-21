---
editUrl: false
next: false
prev: false
title: "AssetTransferParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### assetAmount

> **assetAmount**: [`uint64`](../type-aliases/uint64.md)

The amount of the asset being transferred

#### Source

[types/global.d.ts:687](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L687)

***

### assetCloseTo?

> **`optional`** **assetCloseTo**: [`Address`](../classes/Address.md)

The address to close the asset to

#### Source

[types/global.d.ts:693](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L693)

***

### assetReceiver

> **assetReceiver**: [`Address`](../classes/Address.md)

The receiver of the asset

#### Source

[types/global.d.ts:691](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L691)

***

### assetSender?

> **`optional`** **assetSender**: [`Address`](../classes/Address.md)

The clawback target

#### Source

[types/global.d.ts:689](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L689)

***

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`fee`](CommonTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L633)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`note`](CommonTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L639)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`rekeyTo`](CommonTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L635)

***

### xferAsset

> **xferAsset**: [`Asset`](../classes/Asset.md)

The asset being transfed

#### Source

[types/global.d.ts:685](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L685)

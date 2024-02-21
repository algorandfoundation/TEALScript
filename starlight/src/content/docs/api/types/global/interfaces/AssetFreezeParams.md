---
editUrl: false
next: false
prev: false
title: "AssetFreezeParams"
---

## Extends

- [`CommonTransactionParams`](CommonTransactionParams.md)

## Properties

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`fee`](CommonTransactionParams.md#fee)

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L633)

***

### freezeAsset

> **freezeAsset**: [`Asset`](../classes/Asset.md)

#### Source

[types/global.d.ts:719](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L719)

***

### freezeAssetAccount

> **freezeAssetAccount**: [`Address`](../classes/Address.md)

#### Source

[types/global.d.ts:720](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L720)

***

### freezeAssetFrozen

> **freezeAssetFrozen**: `boolean`

#### Source

[types/global.d.ts:721](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L721)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`note`](CommonTransactionParams.md#note)

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L639)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`rekeyTo`](CommonTransactionParams.md#rekeyto)

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Inherited from

[`CommonTransactionParams`](CommonTransactionParams.md).[`sender`](CommonTransactionParams.md#sender)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L635)

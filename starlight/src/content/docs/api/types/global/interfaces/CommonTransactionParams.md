---
editUrl: false
next: false
prev: false
title: "CommonTransactionParams"
---

## Extended by

- [`AssetTransferParams`](AssetTransferParams.md)
- [`AssetConfigParams`](AssetConfigParams.md)
- [`AssetCreateParams`](AssetCreateParams.md)
- [`AssetFreezeParams`](AssetFreezeParams.md)
- [`PaymentParams`](PaymentParams.md)
- [`AppParams`](AppParams.md)
- [`KeyRegParams`](KeyRegParams.md)
- [`OnlineKeyRegParams`](OnlineKeyRegParams.md)

## Properties

### fee?

> **`optional`** **fee**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

#### Source

[types/global.d.ts:633](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L633)

***

### note?

> **`optional`** **note**: `string`

The note field for this transaction

#### Source

[types/global.d.ts:639](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L639)

***

### rekeyTo?

> **`optional`** **rekeyTo**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

#### Source

[types/global.d.ts:637](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L637)

***

### sender?

> **`optional`** **sender**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

#### Source

[types/global.d.ts:635](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L635)

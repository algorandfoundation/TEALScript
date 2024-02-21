---
editUrl: false
next: false
prev: false
title: "verifyTxn"
---

> **verifyTxn**(`txn`, `params`): `any`

Verifies the fields of a transaction against the given parameters.

## Parameters

• **txn**: [`AssetTransferParams`](../interfaces/AssetTransferParams.md) \| [`AssetFreezeParams`](../interfaces/AssetFreezeParams.md) \| [`ThisTxnParams`](../type-aliases/ThisTxnParams.md) \| `Required`\<[`PaymentParams`](../interfaces/PaymentParams.md)\> \| [`AppCallTxn`](../type-aliases/AppCallTxn.md) \| `Required`\<[`KeyRegParams`](../interfaces/KeyRegParams.md)\> \| `Required`\<[`AssetConfigParams`](../interfaces/AssetConfigParams.md)\> \| [`Txn`](../type-aliases/Txn.md)

the transaction to verify

• **params**: [`TxnVerificationFields`](../type-aliases/TxnVerificationFields.md)

the transaction fields to verify in the given transaction

## Returns

`any`

## Source

[types/global.d.ts:1140](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L1140)

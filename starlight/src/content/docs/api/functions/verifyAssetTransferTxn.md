---
editUrl: false
next: false
prev: false
title: "verifyAssetTransferTxn"
---

> **verifyAssetTransferTxn**(`txn`, `params`): `txn is Required<AssetTransferParams>`

Verifies the fields of an asset transfer transaction against the given parameters.

## Parameters

• **txn**: `Required`\<[`AssetTransferParams`](../interfaces/AssetTransferParams.md)\> \| [`Txn`](../type-aliases/Txn.md)

the transaction to verify

• **params**: [`AssetTransferTxnVerificationFields`](../type-aliases/AssetTransferTxnVerificationFields.md)

the transaction fields to verify in the given transaction

## Returns

`txn is Required<AssetTransferParams>`

## Source

[types/global.d.ts:1170](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1170)

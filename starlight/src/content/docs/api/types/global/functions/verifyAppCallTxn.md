---
editUrl: false
next: false
prev: false
title: "verifyAppCallTxn"
---

> **verifyAppCallTxn**(`txn`, `params`): `txn is AppCallTxn`

Verifies the fields of an app call transaction against the given parameters.

## Parameters

• **txn**: [`ThisTxnParams`](../type-aliases/ThisTxnParams.md) \| [`AppCallTxn`](../type-aliases/AppCallTxn.md) \| [`Txn`](../type-aliases/Txn.md)

the transaction to verify

• **params**: [`AppCallTxnVerificationFields`](../type-aliases/AppCallTxnVerificationFields.md)

the transaction fields to verify in the given transaction

## Returns

`txn is AppCallTxn`

## Source

[types/global.d.ts:1181](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L1181)

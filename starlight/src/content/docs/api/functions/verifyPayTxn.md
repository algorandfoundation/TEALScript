---
editUrl: false
next: false
prev: false
title: "verifyPayTxn"
---

> **verifyPayTxn**(`txn`, `params`): `txn is Required<PaymentParams>`

Verifies the fields of a pay transaction against the given parameters.

## Parameters

• **txn**: `Required`\<[`PaymentParams`](../interfaces/PaymentParams.md)\> \| [`Txn`](../type-aliases/Txn.md)

the transaction to verify

• **params**: [`PayTxnVerificationFields`](../type-aliases/PayTxnVerificationFields.md)

the transaction fields to verify in the given transaction

## Returns

`txn is Required<PaymentParams>`

## Source

[types/global.d.ts:1151](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1151)

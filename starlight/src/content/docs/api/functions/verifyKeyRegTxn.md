---
editUrl: false
next: false
prev: false
title: "verifyKeyRegTxn"
---

> **verifyKeyRegTxn**(`txn`, `params`): `txn is Required<KeyRegParams>`

Verifies the fields of a key reg transaction against the given parameters.

## Parameters

• **txn**: `Required`\<[`KeyRegParams`](../interfaces/KeyRegParams.md)\> \| [`Txn`](../type-aliases/Txn.md)

the transaction to verify

• **params**: [`KeyRegTxnVerificationFields`](../type-aliases/KeyRegTxnVerificationFields.md)

the transaction fields to verify in the given transaction

## Returns

`txn is Required<KeyRegParams>`

## Source

[types/global.d.ts:1192](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L1192)

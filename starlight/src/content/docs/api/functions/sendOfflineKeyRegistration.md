---
editUrl: false
next: false
prev: false
title: "sendOfflineKeyRegistration"
---

> **sendOfflineKeyRegistration**(`params`): `void`

## Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`void`

## Source

[types/global.d.ts:859](https://github.com/algorandfoundation/tealscript/blob/e015f8b0/types/global.d.ts#L859)

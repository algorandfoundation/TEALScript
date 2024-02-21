---
editUrl: false
next: false
prev: false
title: "sendPayment"
---

> **sendPayment**(`params`): `void`

Send a payment transaction

## Parameters

• **params**

• **params\.amount?**: [`uint64`](../type-aliases/uint64.md)

The amount, in microALGO, to transfer

• **params\.closeRemainderTo?**: [`Address`](../classes/Address.md)

If set, bring the sender balance to 0 and send all remaining balance to this address

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.receiver?**: [`Address`](../classes/Address.md)

The address of the receiver

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

## Returns

`void`

## Source

[types/global.d.ts:853](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L853)

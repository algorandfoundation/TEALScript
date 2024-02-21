---
editUrl: false
next: false
prev: false
title: "sendOnlineKeyRegistration"
---

> **sendOnlineKeyRegistration**(`params`): `void`

## Parameters

• **params**

• **params\.fee?**: [`uint64`](../type-aliases/uint64.md)

The fee paid for this transaction

• **params\.note?**: `string`

The note field for this transaction

• **params\.rekeyTo?**: [`Address`](../classes/Address.md)

If set, changes the authAddr of `sender` to the given address

• **params\.selectionPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.sender?**: [`Address`](../classes/Address.md)

The sender of this transaction. This is the account that pays the fee (if non-zero)

• **params\.stateProofPK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

• **params\.voteFirst**: [`uint64`](../type-aliases/uint64.md)

• **params\.voteKeyDilution**: [`uint64`](../type-aliases/uint64.md)

• **params\.voteLast**: [`uint64`](../type-aliases/uint64.md)

• **params\.votePK**: [`Brand`](../type-aliases/Brand.md)\<`string`, `"bytes"`\>

## Returns

`void`

## Source

[types/global.d.ts:858](https://github.com/algorandfoundation/tealscript/blob/18ba30a9/types/global.d.ts#L858)
